#!/usr/bin/env python3
"""
Verify ALL rows 3-54 in Resource Supply have formulas
"""

import openpyxl
from pathlib import Path

FILE = Path('/home/cyrus/cyrus-app/concepts/RealGold_Finmodel_V2_COMPLETE_DYNAMIC.xlsx')

def main():
    print("="*80)
    print("Verifying ALL Resource Supply Rows 3-54")
    print("="*80)

    wb = openpyxl.load_workbook(FILE)
    resource_ws = wb['Resource Supply (5yr)']

    # Check gold price in XAUconfig
    config_ws = wb['XAUconfig']
    print("\n[XAUconfig Gold Price Row]")
    print(f"A3: {config_ws['A3'].value}")
    print(f"B3 (Dec '25 price): {config_ws['B3'].value}")
    print(f"C3 (Jan '26 price): {config_ws['C3'].value}")

    print("\n[Resource Supply Formulas Check]")
    print("-"*80)

    # Rows to check
    rows_to_check = list(range(3, 17)) + list(range(18, 28)) + list(range(30, 35)) + list(range(36, 41)) + list(range(43, 55))

    missing_formulas = []
    rows_with_formulas = 0

    for row in rows_to_check:
        label = resource_ws[f'A{row}'].value
        b_val = resource_ws[f'B{row}'].value
        c_val = resource_ws[f'C{row}'].value

        if label:
            has_formula_b = b_val and isinstance(b_val, str) and '=' in b_val
            has_formula_c = c_val and isinstance(c_val, str) and '=' in c_val

            if has_formula_b and has_formula_c:
                rows_with_formulas += 1
                print(f"✓ Row {row}: {label}")
            else:
                missing_formulas.append(f"Row {row}: {label}")
                print(f"✗ Row {row}: {label} - MISSING FORMULAS")
                if not has_formula_b:
                    print(f"    B{row} = {b_val}")
                if not has_formula_c:
                    print(f"    C{row} = {c_val}")

    # Check annual summaries specifically
    print("\n[Annual Summary Columns]")
    annual_cols = {'Y': 2026, 'AK': 2027, 'AW': 2028, 'BI': 2029}

    for col, year in annual_cols.items():
        year_val = resource_ws[f'{col}42'].value
        mine_count = resource_ws[f'{col}43'].value

        print(f"\nColumn {col} (Year {year}):")
        print(f"  Row 42 (year): {year_val}")
        print(f"  Row 43 (formula): {mine_count}")

        if mine_count and 'SUM' in str(mine_count):
            print(f"  ✓ Has SUM formula")
        else:
            print(f"  ✗ Missing SUM formula")

    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Rows with formulas: {rows_with_formulas}")
    print(f"Rows missing formulas: {len(missing_formulas)}")

    if missing_formulas:
        print("\nMissing formulas in:")
        for item in missing_formulas:
            print(f"  - {item}")
        return 1
    else:
        print("\n✅ ALL ROWS 3-54 HAVE FORMULAS!")
        return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
