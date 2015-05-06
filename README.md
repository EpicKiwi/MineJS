# MineJS
##Introduction
MineJS est un gestionnaire graphique de serveur minecraft. Il présente une interface agréable pour administrer son serveur sans toucher a la configuration ni aux commandes. Développé en Javascript avec NodeJS il se construit comme une façade entre le serveur et l'administrateur. L'installation permet de télécharger un serveur automatiquement et de le configurer, après cette installation l'administrateur démarre,arrête ou relance le serveur a l'aide d'une interface web disponible a l'adresse de son serveur minecraft mais sur le port donnée dans la configuration (80 par défaut). L’état du serveur et le nombre de joueur est donné en direct sur l'interface web en analysant les retour dans la console du serveur.
##Applications
MineJS est pourvus d'un système d'applications permettant d'exploiter plus en profondeur les capacités d'un tel système d'administration. Pour le moment il n'existe que quelques applications livrés par défaut avec MineJS : 

 * *Setup* : L'application permettant l'installation de MineJS
 * *Config* : Une application permettant de configurer complètement son serveur Minecraft.

##Téléchargement
Pour télécharger MineJS vous pouvez cloner ce repository sur votre bureau ou télécharger une archive complète contenant les modules NodeJS.

 * [Version 0.1.0](https://dl.dropboxusercontent.com/u/50252996/Karton/MineJS-010.zip)

##Installation
Vous devez impérativement avoir installé sur votre machine [NodeJS](https://nodejs.org/) et [Java](https://www.java.com/fr/download/) et avoir les deux chemins dans la variable *PATH* du système.

Si vous avez cloné le repository vous devez toute d’abord installer les dépendances

 * Naviguez dans le dossier *core/* avec l'invité de commande
 * Installez les dépendances en utilisant la commande *npm install express socket.io js-yaml colors*
 * Cliquez sur le fichier *run.bat* a la racine de MineJS ou lancez la commande *node server.js* a la racine pour les non Windows.
 * Accédez a l'adresse [localhost](http://127.0.0.1/) dans votre navigateur

Si vous avez téléchargé l'archive

 * Décompressez l'archive dans le dossier de votre choix
 * Cliquez sur le fichier *run.bat* ou lancez la commande *node server.js* dans le dossier décompressé pour les non windows.
 * Accédez a l'adresse [localhost](http://127.0.0.1/) dans votre navigateur

##Dépendances
MineJS dépend des modules NodeJS suivants : 

 * Express
 * Socket.io
 * js-yaml
 * colors
