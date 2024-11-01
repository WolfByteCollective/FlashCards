# import sys
# import unittest
# import coverage
# from pathlib import Path

# # Start coverage monitoring
# cov = coverage.Coverage()
# cov.start()

# # Add the parent directory to sys.path
# sys.path.append(str(Path(__file__).parent.parent))

# # Import your test classes
# from test.test_auth import TestAuth
# from test.test_deck import TestDeck
# from test.test_card import CardTestApp
# from test.test_folders import TestFolders

# def test_suite():
#     suite = unittest.TestSuite()
#     suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestAuth))
#     suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestDeck))
#     suite.addTests(unittest.TestLoader().loadTestsFromTestCase(CardTestApp))
#     suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestFolders))
#     return suite

# if __name__ == '__main__':
#     runner = unittest.TextTestRunner()
#     result = runner.run(test_suite())
    
#     # Stop coverage monitoring and save results
#     cov.stop()
#     cov.save()
    
#     # Generate coverage reports
#     cov.xml_report()
#     cov.html_report()
    
#     sys.exit(not result.wasSuccessful())

# test/test_main.py
import sys
import unittest
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

# Import your test classes
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