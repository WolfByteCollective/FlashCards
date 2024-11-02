# from flask import Flask
# import sys
# sys.path.append('backend/src')
# import unittest
# import json
# import pytest
# from unittest.mock import patch
# from src.auth.routes import auth_bp
# from src.deck.routes import deck_bp
# from src.cards.routes import card_bp

# class CardTestApp(unittest.TestCase):
#     def setUp(self):
#         @classmethod
#         self.app = Flask(__name__, instance_relative_config=False)
#         self.app.config['TESTING'] = True
#         self.app.register_blueprint(deck_bp)
#         self.app.register_blueprint(card_bp)
#         self.app.register_blueprint(auth_bp)
#         self.client = self.app.test_client()

#     @patch('src.auth.routes.auth')
#     @patch('src.deck.routes.db')
#     @patch('src.cards.routes.db')
#     def test_deck_card_all_route(self, mock_cards_db, mock_deck_db, mock_auth):
#         '''Test the deck/card/all route of our app'''
#         # Mock authentication
#         mock_auth.sign_in_with_email_and_password.return_value = {
#             'localId': 'Test',
#             'idToken': 'some_token'
#         }

#         # Login
#         self.client.post(
#             '/login',
#             data=json.dumps({
#                 'email': 'aaronadb@gmail.com',
#                 'password': 'flashcards123'
#             }),
#             content_type='application/json'
#         )

#         # Create deck
#         self.client.post(
#             '/deck/create',
#             data=json.dumps({
#                 'localId': 'Test',
#                 'title': 'TestDeck',
#                 'description': 'This is a test deck',
#                 'visibility': 'public'
#             }),
#             content_type='application/json'
#         )

#         # Test get cards
#         response = self.client.get('/deck/Test/card/all')
#         self.assertEqual(response.status_code, 200)

#     @patch('src.auth.routes.auth')
#     @patch('src.deck.routes.db')
#     def test_deck_card_all_route_post(self, mock_deck_db, mock_auth):
#         '''Test that the post request to the '/deck/card/all' route is not allowed'''
#         # Mock authentication
#         mock_auth.sign_in_with_email_and_password.return_value = {
#             'localId': 'Test',
#             'idToken': 'some_token'
#         }

#         # Login
#         self.client.post(
#             '/login',
#             data=json.dumps({
#                 'email': 'aaronadb@gmail.com',
#                 'password': 'flashcards123'
#             }),
#             content_type='application/json'
#         )

#         # Create deck
#         self.client.post(
#             '/deck/create',
#             data=json.dumps({
#                 'localId': 'Test',
#                 'title': 'TestDeck',
#                 'description': 'This is a test deck',
#                 'visibility': 'public'
#             }),
#             content_type='application/json'
#         )

#         # Test post request to card/all
#         response = self.client.post('/deck/Test/card/all')
#         self.assertEqual(response.status_code, 405)

#     @patch('src.auth.routes.auth')
#     @patch('src.deck.routes.db')
#     @patch('src.cards.routes.db')
#     def test_deck_create_card_route(self, mock_cards_db, mock_deck_db, mock_auth):
#         '''Test the create card in a deck route of our app'''
#         # Mock authentication
#         mock_auth.sign_in_with_email_and_password.return_value = {
#             'localId': 'Test',
#             'idToken': 'some_token'
#         }

#         # Mock database responses
#         mock_cards_db.child.return_value.push.return_value = {'name': 'test_card_id'}

#         # Login
#         self.client.post(
#             '/login',
#             data=json.dumps({
#                 'email': 'aaronadb@gmail.com',
#                 'password': 'flashcards123'
#             }),
#             content_type='application/json'
#         )

#         # Create deck
#         self.client.post(
#             '/deck/create',
#             data=json.dumps({
#                 'localId': 'Test',
#                 'title': 'TestDeck',
#                 'description': 'This is a test deck',
#                 'visibility': 'public'
#             }),
#             content_type='application/json'
#         )

#         # Create card
#         response = self.client.post(
#             '/deck/Test/card/create',
#             data=json.dumps({
#                 'localId': 'Test',
#                 'cards': [{'front': 'front', 'back': 'back', 'hint': 'hint'}]
#             }),
#             content_type='application/json'
#         )
        
#         self.assertEqual(response.status_code, 201)

# if __name__ == "__main__":
#     unittest.main()

from flask import Flask
import sys
sys.path.append('backend/src')
import unittest
import json
import pytest
from unittest.mock import patch
from src.auth.routes import auth_bp
from src.deck.routes import deck_bp
from src.cards.routes import card_bp
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

class CardTestApp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = Flask(__name__, instance_relative_config=False)
        cls.app.config['TESTING'] = True
        cls.app.register_blueprint(deck_bp)
        cls.app.register_blueprint(card_bp)
        cls.app.register_blueprint(auth_bp)
        cls.client = cls.app.test_client()

    def setUp(self):
        # Setup for each test method
        pass

    @patch('src.auth.routes.auth')
    @patch('src.deck.routes.db')
    @patch('src.cards.routes.db')
    def test_deck_card_all_route(self, mock_cards_db, mock_deck_db, mock_auth):
        '''Test the deck/card/all route of our app'''
        # Mock authentication
        mock_auth.sign_in_with_email_and_password.return_value = {
            'localId': 'Test',
            'idToken': 'some_token'
        }

        # Login
        self.client.post(
            '/login',
            data=json.dumps({
                'email': 'aaronadb@gmail.com',
                'password': 'flashcards123'
            }),
            content_type='application/json'
        )

        # Create deck
        self.client.post(
            '/deck/create',
            data=json.dumps({
                'localId': 'Test',
                'title': 'TestDeck',
                'description': 'This is a test deck',
                'visibility': 'public'
            }),
            content_type='application/json'
        )

        # Test get cards
        response = self.client.get('/deck/Test/card/all')
        self.assertEqual(response.status_code, 200)

    @patch('src.auth.routes.auth')
    @patch('src.deck.routes.db')
    def test_deck_card_all_route_post(self, mock_deck_db, mock_auth):
        '''Test that the post request to the '/deck/card/all' route is not allowed'''
        # Mock authentication
        mock_auth.sign_in_with_email_and_password.return_value = {
            'localId': 'Test',
            'idToken': 'some_token'
        }

        # Login
        self.client.post(
            '/login',
            data=json.dumps({
                'email': 'aaronadb@gmail.com',
                'password': 'flashcards123'
            }),
            content_type='application/json'
        )

        # Create deck
        self.client.post(
            '/deck/create',
            data=json.dumps({
                'localId': 'Test',
                'title': 'TestDeck',
                'description': 'This is a test deck',
                'visibility': 'public'
            }),
            content_type='application/json'
        )

        # Test post request to card/all
        response = self.client.post('/deck/Test/card/all')
        self.assertEqual(response.status_code, 405)

    @patch('src.auth.routes.auth')
    @patch('src.deck.routes.db')
    @patch('src.cards.routes.db')
    def test_deck_create_card_route(self, mock_cards_db, mock_deck_db, mock_auth):
        '''Test the create card in a deck route of our app'''
        # Mock authentication
        mock_auth.sign_in_with_email_and_password.return_value = {
            'localId': 'Test',
            'idToken': 'some_token'
        }

        # Mock database responses
        mock_cards_db.child.return_value.push.return_value = {'name': 'test_card_id'}

        # Login
        self.client.post(
            '/login',
            data=json.dumps({
                'email': 'aaronadb@gmail.com',
                'password': 'flashcards123'
            }),
            content_type='application/json'
        )

        # Create deck
        self.client.post(
            '/deck/create',
            data=json.dumps({
                'localId': 'Test',
                'title': 'TestDeck',
                'description': 'This is a test deck',
                'visibility': 'public'
            }),
            content_type='application/json'
        )

        # Create card
        response = self.client.post(
            '/deck/Test/card/create',
            data=json.dumps({
                'localId': 'Test',
                'cards': [{'front': 'front', 'back': 'back', 'hint': 'hint'}]
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)

if __name__ == "__main__":
    unittest.main()