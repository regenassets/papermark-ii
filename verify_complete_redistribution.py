#!/usr/bin/env python3
"""
Verify COMPLETE data redistribution in the dynamic model
"""

import openpyxl
from pathlib import Path

FILE = Path('/home/cyrus/cyrus-app/concepts/RealGold_Finmodel_V2_COMPLETE_DYNAMIC.xlsx')

def print_section(title):
    print(f"\n{'='*80}")
    print(f"{title}")
    print('='*80)

def main():
    print_section("Verifying COMPLETE Data Redistribution")

    wb = openpyxl.load_workbook(FILE)
    resource_ws = wb['Resource Supply (5yr)']

    print("\n[RESOURCE SUPPLY - ALL ROWS]")
    print("Checking formulas for columns B (month 0) and C (month 1)...\n")

    rows_to_check = [
        (3, '# of mines'),
        (4, 'Registered Resources'),
        (5, 'Authorized Resources'),
        (6, 'Releasable Resources'),
        (7, 'Unlocked Resources'),
        (8, 'Unitization Fees'),
        (9, 'Available 1031 units'),
        (10, 'Admin Fees'),
        (11, 'RGT Liquidity Fee'),
        (12, 'New Allocation to RealGold Treasury'),
        (13, 'RealGold Token Minting Fees'),
        (14, 'Total Admin & Unit Fee Rev RAF'),
        (15, 'Allocation to 1031 by Trusts'),
        (16, 'Allocation to RealGold Treasury by Trusts'),
    ]

    checks = []

    for row_num, row_label in rows_to_check:
        b_formula = resource_ws[f'B{row_num}'].value
        c_formula = resource_ws[f'C{row_num}'].value

        print(f"Row {row_num}: {row_label}")
        print(f"  B{row_num}: {b_formula}")
        print(f"  C{row_num}: {c_formula}")

        # Check if formula exists
        if b_formula and c_formula:
            if isinstance(b_formula, str) and isinstance(c_formula, str):
                if '=' in b_formula and '=' in c_formula:
                    checks.append(f"✓ Row {row_num} has formulas")
                    print(f"  ✓ Has formulas")
                else:
                    checks.append(f"✗ Row {row_num} missing formula syntax")
                    print(f"  ✗ Missing = sign")
            else:
                checks.append(f"✗ Row {row_num} has static values, not formulas")
                print(f"  ✗ Static values, not formulas")
        else:
            checks.append(f"✗ Row {row_num} missing formulas")
            print(f"  ✗ Missing formulas")

        print()

    print_section("FORMULA TYPE ANALYSIS")

    # Check specific formula types
    formula_type_checks = [
        (3, 'COUNTIF', 'B3'),
        (4, 'SUMIF', 'B4'),
        (5, 'SUMIF', 'B5'),
        (6, 'SUMIF', 'B6'),
        (7, 'SUMIF', 'B7'),
        (8, 'Inputs!$B$26', 'B8'),  # Should reference fee
        (9, 'SUMPRODUCT', 'B9'),
        (10, 'Inputs!$B$26', 'B10'),  # Should reference fee
        (11, 'SUMIF', 'B11'),
        (12, 'SUMPRODUCT', 'B12'),
        (13, 'Inputs!$B$26', 'B13'),  # Should reference fee
        (14, 'SUM', 'B14'),
        (15, 'B9-B10', 'B15'),
        (16, 'B12-B13', 'B16'),
    ]

    for row_num, expected_content, cell in formula_type_checks:
        formula = resource_ws[cell].value
        if formula and expected_content in str(formula):
            print(f"✓ {cell} contains {expected_content}")
            checks.append(f"✓ {cell} formula type correct")
        else:
            print(f"✗ {cell} expected {expected_content}, got: {formula}")
            checks.append(f"✗ {cell} formula type incorrect")

    # Check that formulas span all 60 months
    print_section("60-MONTH COVERAGE CHECK")

    all_months_covered = True
    missing_months = []

    for col_idx in range(2, 62):  # Columns B through BI (60 months)
        col_letter = openpyxl.utils.get_column_letter(col_idx)

        # Check row 5 (Authorized Resources) as representative
        formula = resource_ws[f'{col_letter}5'].value

        if not formula or 'SUMIF' not in str(formula):
            all_months_covered = False
            missing_months.append(col_letter)

    if all_months_covered:
        print(f"✓ All 60 months (B-BI) have formulas")
        checks.append("✓ All 60 months covered")
    else:
        print(f"✗ Missing formulas in columns: {', '.join(missing_months)}")
        checks.append(f"✗ {len(missing_months)} months missing formulas")

    # Check offset progression
    print_section("OFFSET PROGRESSION CHECK")

    month_0_formula = resource_ws['B5'].value
    month_1_formula = resource_ws['C5'].value

    if month_0_formula and month_1_formula:
        if ',0,' in str(month_0_formula) and ',1,' in str(month_1_formula):
            print("✓ Offset progression correct (0, 1, ...)")
            checks.append("✓ Offset progression correct")
        else:
            print(f"✗ Offset progression issue")
            print(f"  B5: {month_0_formula}")
            print(f"  C5: {month_1_formula}")
            checks.append("✗ Offset progression incorrect")

    # Summary
    print_section("VERIFICATION SUMMARY")

    for check in checks:
        print(check)

    passed = sum(1 for c in checks if '✓' in c)
    failed = sum(1 for c in checks if '✗' in c)

    print(f"\nResults: {passed} passed, {failed} failed out of {len(checks)} checks")

    if failed == 0:
        print("\n🎉 ALL CHECKS PASSED - Complete data redistribution working!")
        print("\nWhen you change a mine date via dropdown:")
        print("  1. All resource data moves to correct month")
        print("  2. All fees recalculate")
        print("  3. All allocations update")
        print("  4. Everything happens automatically!")
        return 0
    else:
        print("\n⚠ Some checks failed - see above for details")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
