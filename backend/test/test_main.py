
import unittest
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = str(Path(__file__).parent.parent)
sys.path.insert(0, backend_dir)

# Direct imports from the same directory
from test.test_auth import TestAuth
from test.test_deck import TestDeck
from test.test_card import CardTestApp
from test.test_folders import TestFolders

def test_suite():
    suite = unittest.TestSuite()
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestAuth))
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestDeck))
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(CardTestApp))
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestFolders))
    return suite

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(test_suite())