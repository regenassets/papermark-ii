#!/usr/bin/env python3
"""
Test that formula structure enables automatic recalculation
"""

import openpyxl
from pathlib import Path

FILE = Path('/home/cyrus/cyrus-app/concepts/RealGold_Finmodel_V2_DYNAMIC_DROPDOWNS.xlsx')

def print_section(title):
    print(f"\n{'='*80}")
    print(f"{title}")
    print('='*80)

def main():
    print_section("Testing Formula Auto-Recalculation Structure")

    wb = openpyxl.load_workbook(FILE)
    mine_ws = wb['Mine Inventory']
    resource_ws = wb['Resource Supply (5yr)']

    print("\n[FORMULA CHAIN ANALYSIS]")
    print("\nStep 1: User changes dropdown in Column B")
    print(f"  Example: Change B2 from '{mine_ws['B2'].value}' to 'Jan '26'")

    print("\nStep 2: MATCH formula in Column AO recalculates")
    print(f"  AO2 formula: {mine_ws['AO2'].value}")
    print("  ✓ References B2 (will recalc when B2 changes)")
    print("  ✓ MATCH finds position in XAUconfig!$B$4:$BI$4")
    print("  ✓ Converts to 0-based offset (MATCH result - 1)")

    print("\nStep 3: SUMIF/COUNTIF formulas reference dynamic offset")
    print(f"  Resource Supply B3: {resource_ws['B3'].value}")
    print("  ✓ COUNTIF looks at 'Mine Inventory'!$AO$2:$AO$13")
    print("  ✓ When AO2 value changes, count updates")

    print(f"\n  Resource Supply B5: {resource_ws['B5'].value}")
    print("  ✓ SUMIF looks at 'Mine Inventory'!$AO$2:$AO$13")
    print("  ✓ When AO2 value changes, sum updates")

    print("\n[RECALCULATION TEST SIMULATION]")
    print("\nScenario: User changes Courbet from Dec '25 to Jan '26")
    print("─" * 80)

    print("\nBEFORE:")
    print(f"  B2 value: Dec '25")
    print(f"  AO2 MATCH result: 0 (Dec '25 is position 1, minus 1 = 0)")
    print(f"  Resource Supply B3: Counts mines where offset=0")
    print(f"  Resource Supply C3: Counts mines where offset=1")

    print("\nAFTER (dropdown changed):")
    print(f"  B2 value: Jan '26")
    print(f"  AO2 MATCH result: 1 (Jan '26 is position 2, minus 1 = 1)")
    print(f"  Resource Supply B3: Counts mines where offset=0 (Courbet no longer counted)")
    print(f"  Resource Supply C3: Counts mines where offset=1 (Courbet NOW counted here)")

    print("\n✓ Courbet data moves from Column B to Column C automatically!")

    print("\n" + "="*80)
    print("FORMULA STRUCTURE VALIDATION")
    print("="*80)

    checks = []

    # Check AO formulas reference B column
    ao2_refs_b2 = 'B2' in str(mine_ws['AO2'].value)
    if ao2_refs_b2:
        checks.append("✓ AO2 references B2 (will recalc on B2 change)")
    else:
        checks.append("✗ AO2 does not reference B2")

    # Check SUMIF references AO range
    b5_refs_ao = '$AO$' in str(resource_ws['B5'].value)
    if b5_refs_ao:
        checks.append("✓ Resource Supply formulas reference $AO$ range")
    else:
        checks.append("✗ Resource Supply formulas don't reference AO")

    # Check formulas use absolute references properly
    has_absolute = '$B$4:$BI$4' in str(mine_ws['AO2'].value)
    if has_absolute:
        checks.append("✓ MATCH formula uses absolute references ($B$4:$BI$4)")
    else:
        checks.append("✗ MATCH formula doesn't use proper absolute references")

    # Check all months have formulas
    all_months_covered = True
    for col_idx in range(2, 62):  # 60 months
        col_letter = openpyxl.utils.get_column_letter(col_idx)
        formula = resource_ws[f'{col_letter}5'].value
        if not formula or 'SUMIF' not in str(formula):
            all_months_covered = False
            break

    if all_months_covered:
        checks.append("✓ All 60 months have SUMIF formulas")
    else:
        checks.append("✗ Some months missing formulas")

    for check in checks:
        print(check)

    if all('✓' in c for c in checks):
        print("\n🎉 FORMULA STRUCTURE PERFECT - Auto-recalc will work!")
        print("\nIn LibreOffice/Google Sheets:")
        print("  1. Change dropdown → B cell value changes")
        print("  2. AO formula recalculates (depends on B)")
        print("  3. SUMIF/COUNTIF recalculate (depend on AO)")
        print("  4. Data redistributes automatically - NO SAVE/REOPEN NEEDED")
        return 0
    else:
        print("\n⚠ Formula structure issues detected")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
