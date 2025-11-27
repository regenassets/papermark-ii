#!/usr/bin/env python3
"""
Verify the FULLY_DYNAMIC model has correct formulas
"""

import openpyxl
from pathlib import Path

FILE = Path('/home/cyrus/cyrus-workspaces/REG-30/RealGold_Finmodel_V2_FULLY_DYNAMIC.xlsx')

def print_section(title):
    print(f"\n{'='*80}")
    print(f"{title}")
    print('='*80)

def main():
    print_section("Verifying FULLY DYNAMIC Model")

    wb = openpyxl.load_workbook(FILE)

    # Check XAUconfig timeline
    print_section("XAUconfig Timeline")
    config_ws = wb['XAUconfig']
    print(f"B4 (First month): {config_ws['B4'].value}")
    print(f"C4 (Second month): {config_ws['C4'].value}")
    print(f"BI4 (60th month): {config_ws['BI4'].value}")

    # Check Mine Inventory
    print_section("Mine Inventory")
    mine_ws = wb['Mine Inventory']
    print(f"B2 (Courbet date): {mine_ws['B2'].value}")
    print(f"B3 (Mine 2 date): {mine_ws['B3'].value}")
    print(f"\nAO1 (Header): {mine_ws['AO1'].value}")
    print(f"AO2 (Courbet offset): {mine_ws['AO2'].value}")
    print(f"AO3 (Mine 2 offset): {mine_ws['AO3'].value}")

    # Check Resource Supply
    print_section("Resource Supply (5yr)")
    resource_ws = wb['Resource Supply (5yr)']
    print(f"B1 (First header): {resource_ws['B1'].value}")
    print(f"C1 (Second header): {resource_ws['C1'].value}")
    print(f"\nB3 (Mine count month 0): {resource_ws['B3'].value}")
    print(f"C3 (Mine count month 1): {resource_ws['C3'].value}")
    print(f"\nB5 (Gold production month 0): {resource_ws['B5'].value}")
    print(f"C5 (Gold production month 1): {resource_ws['C5'].value}")

    # Check Inputs
    print_section("Inputs Sheet")
    inputs_ws = wb['Inputs']
    print(f"B26 (Unitization fee): {inputs_ws['B26'].value}")
    print(f"B25 (Admin fee): {inputs_ws['B25'].value}")

    # Summary
    print_section("VERIFICATION SUMMARY")

    checks = []

    # Timeline
    if config_ws['B4'].value == "Dec '25":
        checks.append("✓ Timeline starts at Dec '25")
    else:
        checks.append(f"✗ Timeline starts at {config_ws['B4'].value}, expected Dec '25")

    # Dates
    if mine_ws['B2'].value == "Dec '25":
        checks.append("✓ Courbet date is Dec '25")
    else:
        checks.append(f"✗ Courbet date is {mine_ws['B2'].value}, expected Dec '25")

    # MATCH formulas
    if mine_ws['AO2'].value and 'MATCH' in str(mine_ws['AO2'].value):
        checks.append("✓ AO2 contains MATCH formula")
    else:
        checks.append(f"✗ AO2 is not a MATCH formula: {mine_ws['AO2'].value}")

    # SUMIF formulas
    if resource_ws['B3'].value and 'COUNTIF' in str(resource_ws['B3'].value):
        checks.append("✓ Resource Supply B3 contains COUNTIF formula")
    else:
        checks.append(f"✗ Resource Supply B3: {resource_ws['B3'].value}")

    if resource_ws['B5'].value and 'SUMIF' in str(resource_ws['B5'].value):
        checks.append("✓ Resource Supply B5 contains SUMIF formula")
    else:
        checks.append(f"✗ Resource Supply B5: {resource_ws['B5'].value}")

    # Fees
    if inputs_ws['B26'].value == 0.0001:
        checks.append("✓ Unitization fee is 0.0001 (0.01%)")
    else:
        checks.append(f"✗ Unitization fee is {inputs_ws['B26'].value}, expected 0.0001")

    for check in checks:
        print(check)

    if all('✓' in c for c in checks):
        print("\n🎉 ALL CHECKS PASSED - Model is fully dynamic!")
    else:
        print("\n⚠ Some checks failed - see above")

if __name__ == '__main__':
    main()
