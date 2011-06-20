#!/bin/bash -e
#
# Purpose: Pack a Chromium extension directory into crx format
crxmake --pack-extension=src --extension-output=package/userkeys.crx --key-output=userkeys.pem
