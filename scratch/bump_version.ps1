$files = @(
    "CLAUDE.md",
    "ACE-SPEC.md",
    "cli\bin\create-ace-framework.js",
    "DISTRIBUTION.md",
    "docs\rca\RCA-000-template.md",
    "docs\planning\implementation_plan.md",
    "docs\rca\README.md",
    "docs\planning\task_checklist.md",
    "USER_GUIDE.md",
    "README.md",
    "docs\planning\walkthrough.md",
    "scripts\init.sh",
    "docs\adr\ADR-000-template.md",
    "docs\adr\ADR-001-ace-framework-adoption.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "v2\.2", "v2.3"
        Set-Content $file -Value $content -NoNewline
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $file"
    }
}
