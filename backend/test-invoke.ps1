# ╔══════════════════════════════════════════════════════════════╗
# ║          NoteFlow API - Local Invoke Test Commands          ║
# ║          Cognito Auth + Notes CRUD + File/Image Upload     ║
# ║          Using serverless invoke local + JSON files         ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Run all commands from: c:\New folder\Note-taking-app\backend
#
# QUICK START GUIDE:
# ─────────────────────────────────────────────────────────────
# 1. Open PowerShell and cd into the backend folder:
#      cd "c:\New folder\Note-taking-app\backend"
#
# 2. Set your environment variables (run once per terminal session):
#      $env:USER_POOL_ID        = "ap-south-1_1eKLRoE99"
#      $env:USER_POOL_CLIENT_ID = "3urdmjqnlb9d0jjj6ojmd9jl0c"
#      $env:ATTACHMENTS_BUCKET  = "noteflow-attachments-live-370835059417"
#      $env:JWT_SECRET           = "noteflow-jwt-secret-change-me-to-random-string"
#      $env:USERS_TABLE          = "noteflow-api-users-live"
#      $env:NOTES_TABLE          = "noteflow-api-notes-live"
#      $env:TASKS_TABLE          = "noteflow-api-tasks-live"
#      $env:CATEGORIES_TABLE     = "noteflow-api-categories-live"
#      $env:STAGE                = "live"
#      $env:AWS_REGION           = "ap-south-1"
#
# 3. Follow the test flow below:
#    a. Run SIGNUP (command 2) → creates user in AWS Cognito
#    b. Check your email for the 6-digit verification code
#    c. Put the code in events/confirm-signup.json and run CONFIRM SIGNUP (command 3)
#    d. Run LOGIN (command 5) → copy the "token" value from output
#    e. Replace "PASTE_TOKEN_HERE" in:
#         - events/get-me.json
#         - events/update-profile.json
#         - events/create-note.json
#         - events/list-notes.json
#         - events/get-note.json
#         - events/update-note.json
#         - events/notes-stats.json
#         - events/presigned-url.json
#         - events/delete-note.json
#    f. Run CREATE NOTE (command 10) → copy the "noteId" from output
#    g. Replace "PASTE_NOTE_ID_HERE" in:
#         - events/get-note.json
#         - events/update-note.json
#         - events/delete-note.json
#    h. Run the remaining Note CRUD and Upload commands!
# ─────────────────────────────────────────────────────────────


# ══════════════════════════════════════════════
#  1. HEALTH CHECK
# ══════════════════════════════════════════════
serverless invoke local -f health --path events/health.json


# ══════════════════════════════════════════════
#  2. SIGNUP (Registers user in AWS Cognito)
#     Sends 6-digit verification code to email
# ══════════════════════════════════════════════
serverless invoke local -f authSignup --path events/signup.json


# ══════════════════════════════════════════════
#  3. CONFIRM SIGNUP (Verify email with code)
#     Put 6-digit code into events/confirm-signup.json first
# ══════════════════════════════════════════════
serverless invoke local -f authConfirmSignup --path events/confirm-signup.json


# ══════════════════════════════════════════════
#  4. RESEND CONFIRMATION CODE (Optional)
# ══════════════════════════════════════════════
serverless invoke local -f authResendCode --path events/resend-code.json


# ══════════════════════════════════════════════
#  5. LOGIN → Copy the "token" from the response!
# ══════════════════════════════════════════════
serverless invoke local -f authLogin --path events/login.json


# ══════════════════════════════════════════════
#  6. FORGOT PASSWORD (Optional - sends reset code)
# ══════════════════════════════════════════════
serverless invoke local -f authForgotPassword --path events/forgot-password.json


# ══════════════════════════════════════════════
#  7. RESET PASSWORD (Optional - confirm new password)
#     Put reset code into events/reset-password.json first
# ══════════════════════════════════════════════
serverless invoke local -f authResetPassword --path events/reset-password.json


# ══════════════════════════════════════════════
#  8. GET CURRENT USER PROFILE (Requires token)
# ══════════════════════════════════════════════
serverless invoke local -f authMe --path events/get-me.json


# ══════════════════════════════════════════════
#  9. UPDATE USER PROFILE (Requires token)
# ══════════════════════════════════════════════
serverless invoke local -f authProfile --path events/update-profile.json


# ══════════════════════════════════════════════
#  10. CREATE NOTE → Copy the "noteId" from the response!
#      (Requires token)
# ══════════════════════════════════════════════
serverless invoke local -f notesCreate --path events/create-note.json


# ══════════════════════════════════════════════
#  11. LIST NOTES (Requires token)
# ══════════════════════════════════════════════
serverless invoke local -f notesList --path events/list-notes.json


# ══════════════════════════════════════════════
#  12. GET NOTE BY ID (Requires token + noteId)
#      Put noteId into events/get-note.json first
# ══════════════════════════════════════════════
serverless invoke local -f notesGetById --path events/get-note.json


# ══════════════════════════════════════════════
#  13. UPDATE NOTE (Requires token + noteId)
#      Put noteId into events/update-note.json first
# ══════════════════════════════════════════════
serverless invoke local -f notesUpdate --path events/update-note.json


# ══════════════════════════════════════════════
#  14. GET NOTES STATS (Requires token)
# ══════════════════════════════════════════════
serverless invoke local -f notesStats --path events/notes-stats.json


# ══════════════════════════════════════════════
#  15. GET PRESIGNED S3 UPLOAD URL (Requires token)
#      Generates secure S3 upload URL for images/attachments
# ══════════════════════════════════════════════
serverless invoke local -f uploadsPresignedUrl --path events/upload-file.json


# ══════════════════════════════════════════════
#  16. DELETE NOTE (Requires token + noteId)
#      Put noteId into events/delete-note.json first
# ══════════════════════════════════════════════
serverless invoke local -f notesDelete --path events/delete-note.json
