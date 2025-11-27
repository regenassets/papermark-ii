#!/usr/bin/env python3
"""
Test that ALL data types redistribute correctly
"""

import openpyxl
from pathlib import Path

FILE = Path('/home/cyrus/cyrus-app/concepts/RealGold_Finmodel_V2_COMPLETE_DYNAMIC.xlsx')

def main():
    print("="*80)
    print("Testing Complete Data Redistribution")
    print("="*80)

    wb = openpyxl.load_workbook(FILE)
    resource_ws = wb['Resource Supply (5yr)']

    # Test all row types
    test_results = []

    # SUMIF rows - check they reference correct columns
    sumif_tests = [
        (4, 'F', 'Registered Resources'),
        (5, 'M', 'Authorized Resources'),
        (6, 'P', 'Releasable Resources'),
        (7, 'Q', 'Unlocked Resources'),
        (11, 'R', 'RGT Liquidity Fee'),
    ]

    for row, col, name in sumif_tests:
        formula = resource_ws[f'B{row}'].value
        if formula and f'${col}$' in str(formula):
            test_results.append(f"✓ Row {row} ({name}) references Mine Inventory column {col}")
        else:
            test_results.append(f"✗ Row {row} ({name}) missing reference to column {col}")

    # COUNTIF row
    formula = resource_ws['B3'].value
    if formula and 'COUNTIF' in str(formula):
        test_results.append("✓ Row 3 (Mine count) uses COUNTIF")
    else:
        test_results.append("✗ Row 3 (Mine count) missing COUNTIF")

    # Calculated rows that reference Inputs
    fee_tests = [
        (8, 'B5', 'Unitization Fees'),
        (10, 'B7', 'Admin Fees'),
        (13, 'B12', 'Minting Fees'),
    ]

    for row, ref_cell, name in fee_tests:
        formula = resource_ws[f'B{row}'].value
        if formula and ref_cell in str(formula) and 'Inputs!$B$26' in str(formula):
            test_results.append(f"✓ Row {row} ({name}) references {ref_cell} and fee")
        else:
            test_results.append(f"✗ Row {row} ({name}) missing proper calculation")

    # SUMPRODUCT rows
    sumproduct_tests = [
        (9, 'Available 1031 units'),
        (12, 'New Allocation to RealGold Treasury'),
    ]

    for row, name in sumproduct_tests:
        formula = resource_ws[f'B{row}'].value
        if formula and 'SUMPRODUCT' in str(formula) and '=0)' in str(formula):
            test_results.append(f"✓ Row {row} ({name}) uses SUMPRODUCT with offset")
        else:
            test_results.append(f"✗ Row {row} ({name}) missing SUMPRODUCT")

    # Difference calculations
    diff_tests = [
        (14, 'B8+B10', 'Total Admin & Unit Fee'),
        (15, 'B9-B10', 'Allocation to 1031 by Trusts'),
        (16, 'B12-B13', 'Allocation to RealGold Treasury by Trusts'),
    ]

    for row, expected, name in diff_tests:
        formula = resource_ws[f'B{row}'].value
        if formula and expected in str(formula):
            test_results.append(f"✓ Row {row} ({name}) has correct calculation")
        else:
            test_results.append(f"✗ Row {row} ({name}) missing calculation")

    # Print results
    print("\nData Redistribution Test Results:")
    print("-"*80)
    for result in test_results:
        print(result)

    passed = sum(1 for r in test_results if '✓' in r)
    failed = sum(1 for r in test_results if '✗' in r)

    print("\n" + "="*80)
    print(f"Summary: {passed}/{len(test_results)} tests passed")
    print("="*80)

    if failed == 0:
        print("\n✅ ALL DATA TYPES REDISTRIBUTE CORRECTLY!")
        return 0
    else:
        print(f"\n⚠ {failed} test(s) failed")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
