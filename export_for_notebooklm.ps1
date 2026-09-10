# -Encoding UTF8 on every read and write is load-bearing. Windows PowerShell
# 5.1 defaults Get-Content and Add-Content to the ANSI code page (cp1252), so
# without it this script reads the repository's UTF-8 bytes as cp1252 and
# writes them back re-encoded. The generated exports then contain mojibake
# ("Analyze -> Discuss" becomes "Analyze <mojibake> Discuss") even though every
# source file is clean, and anything ingesting them ingests the corruption.

$outputFileBase = "ace_notebooklm_export"
# Clean up old single file if it exists
if (Test-Path "$outputFileBase.md") { Remove-Item "$outputFileBase.md" }
# Clean up old chunks
Get-ChildItem -Path "." -Filter "${outputFileBase}_part*.md" | Remove-Item

# Define the file types we want to ingest into NotebookLM
$extensionsToInclude = @(".md", ".json", ".yaml", ".yml", ".sh", ".ps1")

Write-Host "Gathering ACE Framework files..."
$files = Get-ChildItem -Path "." -Recurse -File | Where-Object { $extensionsToInclude -contains $_.Extension }

# Exclude git, node_modules, and the output files to prevent recursion
$files = $files | Where-Object { 
    $_.FullName -notmatch "\\\.git\\" -and 
    $_.FullName -notmatch "\\node_modules\\" -and 
    $_.Name -notmatch "ace_notebooklm_export" 
}

$totalFiles = $files.Count
Write-Host "Found $totalFiles files to export."

# We will chunk every 120 files to stay safely under NotebookLM's 500k word limit per file.
$filesPerChunk = 120
$chunkIndex = 1
$fileCounter = 0

$currentOutputFile = "${outputFileBase}_part${chunkIndex}.md"
Add-Content -Path $currentOutputFile -Encoding UTF8 -Value "# ACE Framework Knowledge Base (Part $chunkIndex)`n`nGenerated on $(Get-Date)`nThis document contains a portion of the configuration, standards, prompts, and skills for the ACE Framework.`n"

$counter = 1
foreach ($file in $files) {
    if ($fileCounter -ge $filesPerChunk) {
        $chunkIndex++
        $fileCounter = 0
        $currentOutputFile = "${outputFileBase}_part${chunkIndex}.md"
        Add-Content -Path $currentOutputFile -Encoding UTF8 -Value "# ACE Framework Knowledge Base (Part $chunkIndex)`n`nGenerated on $(Get-Date)`nThis document contains a portion of the configuration, standards, prompts, and skills for the ACE Framework.`n"
    }

    $relativePath = Resolve-Path -Relative $file.FullName
    Write-Host "Processing ($counter/$totalFiles): $relativePath -> $currentOutputFile"
    
    # Add file header separator
    Add-Content -Path $currentOutputFile -Encoding UTF8 -Value "`n---`n`n## File: $relativePath`n"
    
    # Read file content safely
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # If it's markdown, inject it directly. If it's code/config, wrap it in a code block.
        if ($file.Extension -eq ".md") {
            Add-Content -Path $currentOutputFile -Encoding UTF8 -Value $content
        } else {
            $ext = $file.Extension.Substring(1)
            Add-Content -Path $currentOutputFile -Encoding UTF8 -Value "``````$ext`n$content`n``````"
        }
    } catch {
        Write-Warning "Could not read $relativePath. Skipping."
    }
    
    $counter++
    $fileCounter++
}

Write-Host "Export successfully chunked into $chunkIndex files!"
Write-Host 'You can now upload all the ace_notebooklm_export_partX.md files into Google NotebookLM.'
