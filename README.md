modules = ["nodejs-20", "python-3.11", "web"]
run = "npm run dev"

[nix]
channel = "stable-24_05"
packages = ["cairo", "ffmpeg-full", "freetype", "ghostscript", "glibcLocales", "gobject-introspection", "gtk3", "libxcrypt", "pkg-config", "qhull", "tcl", "tk", "xsimd"]

[deployment]
run = ["sh", "-c", "npm run start"]
build = ["sh", "-c", "npm run build"]

[[ports]]
localPort = 5000
externalPort = 80

[workflows]
runButton = "Production"

[[workflows.workflow]]
name = "Production"
author = 45424881
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run build"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run start"
