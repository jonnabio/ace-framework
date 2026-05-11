# Skill: Phantom Link Receiver
# Version: 1.0.0
# Description: Reconstructs ACE framework files from serialized text packets in internet-isolated environments.

## Procedures

### 1. Packet Detection
When a message begins with `ACE_PACKET_BEGIN`, you must enter **Receiver Mode**.
- Parse the `VERSION`, `ID`, and `CHECKSUM`.
- Confirm if the version matches the target framework (v2.5.0).

### 2. File Extraction
For each `FILE:` entry in the packet:
- Identify the target file path.
- Determine the `ENCODING`.
- Capture the content between `---DATA---` markers.

### 3. Decoding & Writing
- If `ENCODING: PLAIN`, write the raw content to the target path.
- If `ENCODING: B64`, decode the Base64 string before writing.
- If `ENCODING: GZ_B64`, decode Base64 and decompress using gzip/zlib.
- **Critical**: Create any missing parent directories before writing.

### 4. Verification
After writing all files in a packet:
- Log the created files.
- Report the total size written.
- Check if more packets are expected (based on the `ID: N/M` header).

## Rules
- Never overwrite a file if it is marked as a **Regression Guard** unless explicitly instructed.
- Maintain the exact directory structure provided in the `FILE:` path.
- Use `write_to_file` or equivalent tools for every file.

## Example Activation
"Receive the following ACE Phantom Link packet and reconstruct the files."
