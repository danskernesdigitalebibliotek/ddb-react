up:
	./scripts/docker-compose.sh

token:
	docker-compose run node node ./scripts/generateToken.js

remove-vscode-config:
	rm -rf .vscode

vscode-config: remove-vscode-config
	cp -r .example.vscode/ .vscode/

remove-intellij-config:
	rm -rf .idea

intellij-config: remove-intellij-config
	cp -r .example.idea/ .idea/

editor-config: vscode-config intellij-config