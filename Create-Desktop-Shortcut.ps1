$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Native Windows Standalone Portable Executable Shortcut
$PortableExePath = Join-Path -Path $ScriptDir -ChildPath "release\Transformer19 Trading Cockpit 1.0.0.exe"
if (Test-Path $PortableExePath) {
    $ShortcutExePath = Join-Path -Path $DesktopPath -ChildPath "Transformer19 Trading Cockpit.lnk"
    $ShortcutExe = $WshShell.CreateShortcut($ShortcutExePath)
    $ShortcutExe.TargetPath = $PortableExePath
    $ShortcutExe.WorkingDirectory = Split-Path -Parent $PortableExePath
    $ShortcutExe.Description = "Transformer19 - 100K Trading Execution Cockpit (Portable Windows App)"
    $ShortcutExe.Save()
    Write-Host "[SUCCESS] Standalone Portable App Shortcut: $ShortcutExePath"
}

# 2. One-Click Batch Launcher Shortcut
$BatPath = Join-Path -Path $ScriptDir -ChildPath "Launch-Transformer19-Cockpit.bat"
$ShortcutBatPath = Join-Path -Path $DesktopPath -ChildPath "Transformer19 Cockpit (Live Dev Shell).lnk"
$ShortcutBat = $WshShell.CreateShortcut($ShortcutBatPath)
$ShortcutBat.TargetPath = $BatPath
$ShortcutBat.WorkingDirectory = $ScriptDir
$ShortcutBat.Description = "Transformer19 Cockpit 1-Click Fast Launcher"
$ShortcutBat.Save()
Write-Host "[SUCCESS] Live Fast Launcher Shortcut: $ShortcutBatPath"
