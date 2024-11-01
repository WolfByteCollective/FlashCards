
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from datetime import datetime
from __init__ import firebase

deck_bp = Blueprint('deck_bp', __name__)
db = firebase.database()

@deck_bp.route('/deck/<id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def getdeck(id):
    '''This method fetches a specific deck by its ID.'''
    try:
        deck = db.child("deck").child(id).get()
        return jsonify(
            deck=deck.val(),
            message='Fetched deck successfully',
            status=200
        ), 200
    except Exception as e:
        return jsonify(
            decks=[],
            message=f"An error occurred: {e}",
            status=400
        ), 400

@deck_bp.route('/deck/all', methods=['GET'])
@cross_origin(supports_credentials=True)
def getdecks():
    '''Fetch all decks. Shows private decks for authenticated users and public decks for non-authenticated users.'''
    args = request.args
    localId = args.get('localId')
    
    try:
        decks = []
        if localId:
            user_decks = db.child("deck").order_by_child("userId").equal_to(localId).get()
            for deck in user_decks.each():
                obj = deck.val()
                obj['id'] = deck.key()
                cards = db.child("card").order_by_child("deckId").equal_to(deck.key()).get()
                obj['cards_count'] = len(cards.val()) if cards.val() else 0
                decks.append(obj)
        else:
            alldecks = db.child("deck").order_by_child("visibility").equal_to("public").get()
            for deck in alldecks.each():
                obj = deck.val()
                obj['id'] = deck.key()
                cards = db.child("card").order_by_child("deckId").equal_to(deck.key()).get()
                obj['cards_count'] = len(cards.val()) if cards.val() else 0
                decks.append(obj)

        return jsonify(decks=decks, message='Fetching decks successfully', status=200), 200
    except Exception as e:
        return jsonify(decks=[], message=f"An error occurred {e}", status=400), 400

@deck_bp.route('/deck/create', methods=['POST'])
@cross_origin(supports_credentials=True)
def create():
    '''Create a new deck.'''
    try:
        data = request.get_json()
        localId = data['localId']
        title = data['title']
        description = data['description']
        visibility = data['visibility']
        
        db.child("deck").push({
            "userId": localId,
            "title": title,
            "description": description,
            "visibility": visibility,
            "cards_count": 0,
            "lastOpened": None
        })

        return jsonify(message='Create Deck Successful', status=201), 201
    except Exception as e:
        return jsonify(message=f'Create Deck Failed {e}', status=400), 400

@deck_bp.route('/deck/update/<id>', methods=['PATCH'])
@cross_origin(supports_credentials=True)
def update(id):
    '''Update an existing deck.'''
    try:
        data = request.get_json()
        localId = data['localId']
        title = data['title']
        description = data['description']
        visibility = data['visibility']

        db.child("deck").child(id).update({
            "userId": localId,
            "title": title,
            "description": description,
            "visibility": visibility
        })

        return jsonify(message='Update Deck Successful', status=201), 201
    except Exception as e:
        return jsonify(message=f'Update Deck Failed {e}', status=400), 400

@deck_bp.route('/deck/delete/<id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete(id):
    '''Delete a deck.'''
    try:
        db.child("deck").child(id).remove()
        return jsonify(message='Delete Deck Successful', status=200), 200
    except Exception as e:
        return jsonify(message=f'Delete Deck Failed {e}', status=400), 400

@deck_bp.route('/deck/updateLastOpened/<id>', methods=['PATCH'])
@cross_origin(supports_credentials=True)
def update_last_opened(id):
    '''Update the lastOpened timestamp when a deck is opened.'''
    try:
        current_time = datetime.utcnow().isoformat()
        db.child("deck").child(id).update({"lastOpened": current_time})
        return jsonify(message='Deck lastOpened updated successfully', status=200), 200
    except Exception as e:
        return jsonify(message=f'Failed to update lastOpened: {e}', status=400), 400
