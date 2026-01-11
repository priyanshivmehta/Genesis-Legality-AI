"""
Final Acceptance Test - Production-Grade Legal Clause Parser
=============================================================

Requirements:
1. Extract exactly 15 top-level clauses from c1.pdf
2. Clause 2 must have subclauses: 2.1, 2.2, 2.3, 2.4
3. NO address blocks must appear as clauses
4. Output must have proper nested structure
"""

import sys
sys.path.insert(0, '.')

from ingestion.pdf_handler import extract_text_from_pdf
from segmentation.clause_splitter import segment_clauses

pdf_path = "../uploads/c1.pdf"
text, ocr_used = extract_text_from_pdf(pdf_path)
print(f"📄 Extracted {len(text)} characters from c1.pdf")

# Parse
clauses = segment_clauses(text)
print(f"✂️  Segmented into {len(clauses)} top-level clauses\n")

# ==========================================================================
# TEST 1: Correct number of top-level clauses
# ==========================================================================
print("TEST 1: Top-level clauses")
print("=" * 60)
expected_ids = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
actual_ids = [str(c["id"]) for c in clauses]

test1_pass = True
for exp_id in expected_ids:
    if exp_id in actual_ids:
        clause = [c for c in clauses if c["id"] == exp_id][0]
        print(f"✓ Clause {exp_id:2s} | {clause['title'][:50]:50s}")
    else:
        print(f"✗ MISSING clause {exp_id}")
        test1_pass = False

# ==========================================================================
# TEST 2: Clause 2 subclauses
# ==========================================================================
print("\nTEST 2: Clause 2 nested subclauses")
print("=" * 60)
clause_2 = [c for c in clauses if c["id"] == "2"][0]
subclauses = clause_2.get("subclauses", [])
sub_ids = [str(s["id"]) for s in subclauses]

expected_subs = ["2.1", "2.2", "2.3", "2.4"]
test2_pass = True
for exp_sub in expected_subs:
    if exp_sub in sub_ids:
        sub = [s for s in subclauses if s["id"] == exp_sub][0]
        print(f"✓ {exp_sub} | {sub['title'][:45]:45s}")
    else:
        print(f"✗ MISSING {exp_sub}")
        test2_pass = False

# ==========================================================================
# TEST 3: No address blocks
# ==========================================================================
print("\nTEST 3: No address blocks in clauses")
print("=" * 60)
address_terms = ["Road", "Avenue", "Kato", "Fremont", "CA", "Facsimile", "Attention", "Zip"]
test3_pass = True

for clause in clauses:
    title = clause["title"]
    for term in address_terms:
        if term in title:
            print(f"✗ Found address term '{term}' in clause {clause['id']}: {title}")
            test3_pass = False

if test3_pass:
    print("✓ No address blocks detected in any clause titles")

# ==========================================================================
# TEST 4: Proper output structure
# ==========================================================================
print("\nTEST 4: Output structure validation")
print("=" * 60)
test4_pass = True

for clause in clauses:
    if not all(key in clause for key in ["id", "title", "text", "subclauses"]):
        print(f"✗ Clause {clause['id']} missing required fields")
        test4_pass = False
        break
    
    # Check subclauses structure
    for sub in clause["subclauses"]:
        if not all(key in sub for key in ["id", "title", "text"]):
            print(f"✗ Subclause {sub['id']} missing required fields")
            test4_pass = False
            break

if test4_pass:
    print("✓ All clauses have correct structure with id, title, text, subclauses")
    print(f"✓ Top-level clauses have proper subclauses field")

# ==========================================================================
# FINAL RESULTS
# ==========================================================================
print("\n" + "=" * 60)
print("FINAL ACCEPTANCE TESTS")
print("=" * 60)

all_pass = test1_pass and test2_pass and test3_pass and test4_pass

tests = [
    ("15 top-level clauses", test1_pass),
    ("Clause 2 has subclauses 2.1-2.4", test2_pass),
    ("No address blocks", test3_pass),
    ("Correct output structure", test4_pass),
]

for test_name, passed in tests:
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status:8s} | {test_name}")

print("=" * 60)
if all_pass:
    print("🎉 ALL TESTS PASSED - PRODUCTION READY")
else:
    print("❌ SOME TESTS FAILED - FIX REQUIRED")

sys.exit(0 if all_pass else 1)
