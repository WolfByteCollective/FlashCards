from flask import Flask
import sys
sys.path.append('backend/src')
import unittest
from unittest.mock import patch, MagicMock
import json
from src.auth.routes import auth_bp
from src.deck.routes import deck_bp
from src.cards.routes import card_bp
from datetime import datetime
class DeckTestApp(unittest.TestCase):
    def setUp(self):
        self.app=Flask(__name__, instance_relative_config=False)
        self.app.register_blueprint(deck_bp)
        self.app=self.app.test_client()
        
        
    def test_deck_id_route_get_valid_id(self):
        '''Test the deck/id route of our app with a valid deck id'''
        with self.app:
            self.app.post('/login', data=json.dumps(dict(email='aaronadb@gmail.com', password='flashcards123')), content_type='application/json', follow_redirects=True)
            self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')
            response = self.app.get('/deck/Test')
            assert response.status_code == 200

    
    def test_deck_id_route_post(self):
        '''Test the deck/id route of our app with the post method'''
        with self.app:
            self.app.post('/login', data=json.dumps(dict(email='aaronadb@gmail.com', password='flashcards123')), content_type='application/json', follow_redirects=True)
            self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')
            response = self.app.post('/deck/Test')
            assert response.status_code == 405

    def test_deck_all_route(self):
        '''Test the deck/all route of our app'''
        response=self.app.get('/deck/all',query_string=dict(localId='Test'))
        assert response.status_code==200

    def test_deck_all_route_post(self):
        '''Test that the post request to the '/deck/all' route is not allowed'''
        response=self.app.post('/deck/all')
        assert response.status_code==405

    def test_create_deck_route(self):
        '''Test the create deck route of our app'''
        response = self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')
        assert response.status_code == 201
        
    
    def test_update_deck_route_post(self):
        '''Test the deck/update route of our app with'''
        with self.app:
            self.app.post('/login', data=json.dumps(dict(email='aaronadb@gmail.com', password='flashcards123')), content_type='application/json', follow_redirects=True)
            self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')
            response = self.app.patch('/deck/update/Test', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')
            assert response.status_code == 201
        
   
    def test_delete_deck_route_post(self):
        '''Test the deck/delete route of our app with'''
        with self.app:
            self.app.post('/login', data=json.dumps(dict(email='aaronadb@gmail.com', password='flashcards123')), content_type='application/json', follow_redirects=True)
            self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')
            response = self.app.delete('/deck/delete/Test')
            assert response.status_code == 200

    # new test cases begin here
    def test_update_last_opened_deck_route(self):
        '''Test the deck/updateLastOpened/<id> route of our app'''
        with self.app:
            # Arrange: Mock the database update
            mock_update = MagicMock(return_value=None)
            with patch('src.deck.routes.db.child') as mock_db:
                mock_db.return_value.child.return_value.update = mock_update

                # Simulate user login and deck creation
                self.app.post('/login', data=json.dumps(dict(email='aaronadb@gmail.com', password='flashcards123')), content_type='application/json', follow_redirects=True)
                self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')

                # Act: Send a request to update the last opened timestamp
                response = self.app.patch('/deck/updateLastOpened/Test', content_type='application/json')

                # Assert: Check the response status code and mock database call
                assert response.status_code == 200
                mock_update.assert_called_once_with({"lastOpened": datetime.utcnow().isoformat()})

    def test_update_last_opened_deck_route_failure(self):
        '''Test the deck/updateLastOpened/<id> route of our app with failure scenario'''
        with self.app:
            # Arrange: Mock the database update to raise an exception
            with patch('src.deck.routes.db.child') as mock_db:
                mock_db.return_value.child.return_value.update.side_effect = Exception("Database update failed")

                # Simulate user login and deck creation
                self.app.post('/login', data=json.dumps(dict(email='aaronadb@gmail.com', password='flashcards123')), content_type='application/json', follow_redirects=True)
                self.app.post('/deck/create', data=json.dumps(dict(localId='Test', title='TestDeck', description='This is a test deck', visibility='public')), content_type='application/json')

                # Act: Send a request to update the last opened timestamp
                response = self.app.patch('/deck/updateLastOpened/Test', content_type='application/json')

                # Assert: Check the response status code for failure
                assert response.status_code == 400
                response_data = json.loads(response.data)
                assert response_data['message'] == 'Failed to update lastOpened: Database update failed'

if __name__=="__main__":
    unittest.main()
