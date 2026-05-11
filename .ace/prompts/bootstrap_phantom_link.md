# ACE 2.5 Bootstrap: Phantom Link Initialization

**Message to send to the internal LLM:**

---

I am going to transfer the **ACE Framework v2.5.0** to this environment via a series of text packets. You will act as the **Phantom Link Receiver**.

Please follow these instructions for every message I send that begins with `ACE_PACKET_BEGIN`:

1.  **Extract Files**: Each packet contains one or more files. Identify the `FILE:` path and the data between `---DATA---` markers.
2.  **Handle Encoding**: If the encoding is `PLAIN`, treat the data as raw text.
3.  **Write Files**: Use your tools to create the directories and write the files to the local filesystem.
4.  **Confirm**: After each packet, summarize the files you created and state which packet ID you are waiting for next.
5.  **Role Transition**: Once you receive the final packet, read `.ace/roles/roles.md` and await instructions to "Assume the Architect role".

**Confirm you are ready to receive Packet 1.**

---
