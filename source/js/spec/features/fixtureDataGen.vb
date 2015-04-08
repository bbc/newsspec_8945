Sub TestSheet()
    Application.Calculation = xlCalculationAutomatic
    Workbooks("bbc_cap_calculator-DH06_01_15.xlsm").Activate
    Dim i As Integer
    Dim N As Integer
    N = 258
    Application.ScreenUpdating = False
    For i = 0 To N
        Sheets("Testing").Range("B7:B14").Offset(0, i).Copy
        Sheets("methodology").Select
        Range("c2:c9").Select
        Selection.PasteSpecial Paste:=xlPasteValues

        Sheets("methodology").Range("G2:G9").Copy
        Sheets("Testing").Select
        Range("B17:B24").Offset(0, i).Select
        Selection.PasteSpecial Paste:=xlPasteValues
        
        Sheets("MT calculation").Range("C11:C23").Copy
        Sheets("Testing").Select
        Range("B27:B39").Offset(0, i).Select
        Selection.PasteSpecial Paste:=xlPasteValues
        
        Sheets("MT calculation").Range("C4:C4").Copy
        Sheets("Testing").Select
        Range("B40:B40").Offset(0, i).Select
        Selection.PasteSpecial Paste:=xlPasteValues
    Next i
    Application.ScreenUpdating = True
End Sub


