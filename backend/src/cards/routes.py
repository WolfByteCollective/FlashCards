# backend/src/card/routes.py
#
#MIT License
#
#Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in all
#copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#SOFTWARE.

'''routes.py is a file in cards folder that has all the functions defined that manipulate the cards. All CRUD functions that needs to be performed on cards are defined here.'''
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from datetime import datetime

try:
    from .. import firebase
except ImportError:
    from __init__ import firebase

card_bp = Blueprint(
    'card_bp', __name__
)

db = firebase.database()


@card_bp.route('/deck/<deckId>/card/all', methods = ['GET'])
@cross_origin(supports_credentials=True)
def getcards(deckId):
    '''This method is called when the user want to fetch all of the cards in a deck. Only the deckid is required to fetch all cards from the required deck.'''
    try:
        user_cards = db.child("card").order_by_child("deckId").equal_to(deckId).get()
        cards = [card.val() for card in user_cards.each()]
        return jsonify(
            cards = cards,
            message = 'Fetching cards successfully',
            status = 200
        ), 200
    except Exception as e:
        return jsonify(
            cards = [],
            message = f"An error occurred {e}",
            status = 400
        ), 400


@card_bp.route('/deck/<deckId>/card/create', methods = ['POST'])
@cross_origin(supports_credentials=True)
def createcards(deckId):
    '''This method is routed when the user requests to create new cards in a deck. 
    Only the deckid is required to add cards to a deck.'''
    try:
        data = request.get_json()
        localId = data['localId']
        cards = data['cards']
        
        '''remove existing cards'''
        previous_cards = db.child("card").order_by_child("deckId").equal_to(deckId).get()
        for card in previous_cards.each():
            db.child("card").child(card.key()).remove()
        
        '''add new cards'''
        for card in cards:
            db.child("card").push({
                "userId": localId,
                "deckId": deckId,
                "front": card['front'], 
                "back": card['back'],
                "hint": card['hint']
            })
        
        return jsonify(
            message = 'Adding cards Successful',
            status = 201
        ), 201
    except:
        return jsonify(
            message = 'Adding cards Failed',
            status = 400
        ), 400


@card_bp.route('/deck/<id>/update/<cardid>', methods = ['PATCH'])
@cross_origin(supports_credentials=True)
def updatecard(id,cardid):
    '''This method is called when the user requests to update cards in a deck. The card can be updated in terms of its word and meaning.
    Here deckid and cardid is required to uniquely identify a updating card.'''
    try:
        data = request.get_json()
        deckid = id
        cardid=cardid
        word = data['word']
        meaning = data['meaning']
        
        db.child("card").order_by_child("Id").equal_to(f"{deckid}_{cardid}").update({
            "Id": f"{deckid}_{cardid}","deckid" : {deckid}, "word": word, "meaning": meaning
        })
        
        return jsonify(
            message = 'Update Card Successful',
            status = 201
        ), 201
    except Exception as e:
        return jsonify(
            message = f'Update Card Failed {e}',
            status = 400
        ), 400
 

@card_bp.route('/deck/<id>/delete/<cardid>', methods = ['DELETE'])
@cross_origin(supports_credentials=True)
def deletecard(id,cardid):
    '''This method is called when the user requests to delete the card. The deckid and the particular cardid is required to delete the card.'''
    try:
        data = request.get_json()
        deckid = id
        cardid=cardid
        
        db.child("card").order_by_child("Id").equal_to(f"{deckid}_{cardid}").remove()
        
        return jsonify(
            message = 'Delete Card Successful',
            status = 200
        ), 200
    except:
        return jsonify(
            message = 'Delete Card Failed',
            status = 400
        ), 400


@card_bp.route('/deck/<deckId>/leaderboard', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_leaderboard(deckId):
    '''This endpoint fetches the leaderboard data for a specific deck.'''
    try:
        # Fetch leaderboard data for the given deck
        leaderboard_entries = db.child("leaderboard").child(deckId).get()
        leaderboard = []
        for entry in leaderboard_entries.each():
            data = entry.val()
            leaderboard.append({
                "userEmail": data.get("userEmail"),
                "correct": data.get("correct", 0),
                "incorrect": data.get("incorrect", 0),
                "attempts": data.get("attempts", 0),
                "lastAttempt": datetime.now().isoformat()
            })

        # Sort leaderboard by score (correct answers) then by last attempt (descending)
        leaderboard.sort(key=lambda x: (-x["correct"], x["lastAttempt"]), reverse=True)

        return jsonify({
            "leaderboard": leaderboard,
            "message": "Leaderboard data fetched successfully",
            "status": 200
        }), 200
    except Exception as e:
        return jsonify({
            "leaderboard": [],
            "message": f"An error occurred: {e}",
            "status": 400
        }), 400
    
@card_bp.route('/deck/<deck_id>/update-leaderboard', methods=['POST'])
@cross_origin(supports_credentials=True)
def update_leaderboard(deck_id):
    try:
        data = request.get_json()
        # Extract values from the request body
        user_id = data.get("userId")  # Get userId from request body
        user_email = data.get("userEmail")  # Keep for logging or notification
        correct = data.get("correct")
        incorrect = data.get("incorrect")
        attempts = data.get("attempts")

        if not user_id:
            return jsonify({"message": "User ID is required"}), 400  # Validate userId presence

        # Use user_id from request body to update the leaderboard
        leaderboard_ref = db.child("leaderboard").child(deck_id).child(user_id)
        leaderboard_ref.update({
            "userEmail": user_email,
            "correct": correct,
            "incorrect": incorrect,
            "attempts": attempts,
            "lastAttempt": datetime.now().isoformat()
        })

        return jsonify({"message": "Leaderboard updated successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Failed to update leaderboard", "error": str(e)}), 500