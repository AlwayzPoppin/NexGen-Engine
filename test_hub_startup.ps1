$Dest = "$env:USERPROFILE\OneDrive\NexGen-App"
cd $Dest
.\nexgen-hub.exe 2>&1 | Tee-Object -FilePath "hub_startup.log"
