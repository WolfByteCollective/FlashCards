import json
import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from src.deck.routes import deck_bp  # Adjust the import based on your app structure

class DeckTestApp(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__, instance_relative_config=False)
        self.app.register_blueprint(deck_bp)
        self.app = self.app.test_client()

    @patch('src.deck.routes.db')
    def test_get_user_score_success(self, mock_db):
        '''Test successful fetch of user score with valid data'''
        deck_id = "TestDeck"
        user_id = "user123"

        mock_leaderboard_entry = MagicMock()
        mock_leaderboard_entry.val.return_value = {
            "correct": 10,
            "incorrect": 2
        }
        mock_db.child.return_value.child.return_value.child.return_value.get.return_value = mock_leaderboard_entry

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['score'] == {
            "correct": 10,
            "incorrect": 2
        }
        assert response_data['message'] == "User score fetched successfully"

    @patch('src.deck.routes.db')
    def test_get_user_score_perfect_score(self, mock_db):
        '''Test case for a user with perfect score'''
        deck_id = "TestDeck"
        user_id = "user123"

        mock_leaderboard_entry = MagicMock()
        mock_leaderboard_entry.val.return_value = {
            "correct": 20,
            "incorrect": 0
        }
        mock_db.child.return_value.child.return_value.child.return_value.get.return_value = mock_leaderboard_entry

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['score']['correct'] == 20
        assert response_data['score']['incorrect'] == 0

    @patch('src.deck.routes.db')
    def test_get_user_score_all_incorrect(self, mock_db):
        '''Test case for a user with all incorrect answers'''
        deck_id = "TestDeck"
        user_id = "user123"

        mock_leaderboard_entry = MagicMock()
        mock_leaderboard_entry.val.return_value = {
            "correct": 0,
            "incorrect": 15
        }
        mock_db.child.return_value.child.return_value.child.return_value.get.return_value = mock_leaderboard_entry

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['score']['correct'] == 0
        assert response_data['score']['incorrect'] == 15

    @patch('src.deck.routes.db')
    def test_get_user_score_partial_data(self, mock_db):
        '''Test case when only correct score is present'''
        deck_id = "TestDeck"
        user_id = "user123"

        mock_leaderboard_entry = MagicMock()
        mock_leaderboard_entry.val.return_value = {
            "correct": 5
        }
        mock_db.child.return_value.child.return_value.child.return_value.get.return_value = mock_leaderboard_entry

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['score']['correct'] == 5
        assert response_data['score']['incorrect'] == 0  # Should default to 0

    @patch('src.deck.routes.db')
    def test_get_user_score_invalid_deck_id(self, mock_db):
        '''Test case for invalid deck ID'''
        deck_id = ""  # Empty deck ID
        user_id = "user123"

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 404  # Should return not found

    @patch('src.deck.routes.db')
    def test_get_user_score_invalid_user_id(self, mock_db):
        '''Test case for invalid user ID'''
        deck_id = "TestDeck"
        user_id = ""  # Empty user ID

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 404  # Should return not found

    @patch('src.deck.routes.db')
    def test_get_user_score_database_timeout(self, mock_db):
        '''Test case for database timeout'''
        deck_id = "TestDeck"
        user_id = "user123"

        # Simulate a database timeout
        mock_db.child.return_value.child.return_value.child.return_value.get.side_effect = TimeoutError("Database timeout")

        response = self.app.get(f'/deck/{deck_id}/user-score/{user_id}')

        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert "Database timeout" in response_data['message']

    
    @patch('src.deck.routes.db')
    def test_get_user_score_very_large_numbers(self, mock_db):
        '''Test case for very large numbers'''
        deck_id = "TestDeck"
        user_id = "user123"

        mock_leaderboard_entry = MagicMock()
        mock_leaderboard_entry.val.return_value = {
            "correct": 999999
        }