
// Début du code js de la page terminal

(function (global, undefined) {

    var Terminal = Terminal || function(containerID, options) {
        if (!containerID) return;

    if (window.innerWidth < 1000) {
        var defaults = {
            welcome: '<div class="font-version">Vous êtes sur la version mobile ! <br>Des problèmes peuvent survenir sur cette version. <br>Il est conseillé de cliquer sur "Version simplifiée" pour une meilleur expérience sur vyvi.fr !</div> <br>',
            prompt: '<span class="user">mobile</span>@<span class="hostname">vyvi</span>:',
            separator: '$',
            theme: 'modern'
        };
    } else {
        var defaults = {
            welcome: '<div class="font-version">Vous êtes sur la version PC ! </div><br>',
            prompt: '<span class="user">pc</span>@<span class="hostname">vyvi</span>:',
            separator: '$',
            theme: 'interlaced'
        };
    }

    var options = options || defaults;
    options.welcome = options.welcome || defaults.welcome;
    options.prompt = options.prompt || defaults.prompt;
    options.separator = options.separator || defaults.separator;
    options.theme = options.theme || defaults.theme;

    var extensions = Array.prototype.slice.call(arguments, 2);

    var _history = localStorage.history ? JSON.parse(localStorage.history) : [];
    var _histpos = _history.length;
    var _histtemp = '';

    const buttons = [
        { id: 'simple', url: 'simple.html' },
        { id: 'hacking', url: 'hackingToolBox.html' },
        { id: 'analyseur', url: 'analyseur.html' },
    ];

    function onClick(event, url) {
        window.location.href = url;
    }

    function onMouseDown(event) {
        event.currentTarget.classList.add('clicked');
        event.currentTarget.style.transform = 'translate(0px, 0px)';
    }

    buttons.forEach(button => {
        const element = document.getElementById(button.id);
        element.addEventListener('click', (event) => onClick(event, button.url));
        element.addEventListener('mousedown', onMouseDown);
    });

    var _terminal = document.getElementById(containerID);
    _terminal.classList.add('terminal');
    _terminal.classList.add('terminal-' + options.theme);
    _terminal.insertAdjacentHTML('beforeEnd', [
        '<div class="background"><div class="interlace"></div></div>',
        '<div class="header">',
        '<div class="font">',
        'Ecris \'help\' ou \'?\' pour afficher les commandes disponibles !<br>',
        'Ecris \'cat README\' pour en apprendre davantage sur ce site !',
	    '</div>',
        '</div>',
        '<div class="container">',
        '<output></output>',
        '<table class="input-line">',
        '<tr><td nowrap><div class="prompt">' + options.prompt + '/' + options.separator + '</div></td><td width="100%"><input class="cmdline" autofocus></td></tr>',
        '</table>',
        '</div>'].join(''));
    var _container = _terminal.querySelector('.container');
    var _inputLine = _container.querySelector('.input-line');
    var _cmdLine = _container.querySelector('.input-line .cmdline');
    var _output = _container.querySelector('output');
    var _prompt = _container.querySelector('.prompt');
    var _background = document.querySelector('.background');

    var fileType = {
        FILE: 'file',
        DIRECTORY: 'directory',
        LINK: 'link'
    }

    var _fs = {
                'name': '/',
                'type': fileType.DIRECTORY,
                'content': [
                    {
                        'name': 'cv',
                        'type': fileType.LINK,
                        'content': 'public/PDF/cv.pdf'
                    },
                    {
                        'name': 'Mes certificats TryHackMe',
                        'type': fileType.LINK,
                        'content': 'https://tryhackme.com/p/Vyvi?tab=certificates'
                    },
                    {
                        'name': 'contact',
                        'type': 'directory',
                        'content': [
                            {
                                'name':'TryHackMe',
                                'type':fileType.LINK,
                                'content':'https://tryhackme.com/p/Vyvi',
                            },
                            {
                                'name':'YouTube',
                                'type':fileType.LINK,
                                'content':'https://www.youtube.com/@vyvii',
                            },
                            {
                                'name':'GitHub',
                                'type':fileType.LINK,
                                'content':'https://github.com/vyyvii',
                            },
                            {
                                'name':'LinkedIn',
                                'type':fileType.LINK,
                                'content':'www.linkedin.com/in/victor-defauchy-epitech-lyon',
                            },
                            {
                                'name':'E-Mail',
                                'type':fileType.LINK,
                                'content':'mailto:v.defauchy@mailbox.org',
                            },
                        ]
                    },
                    {
                    	'name': 'README',
                    	'type': fileType.FILE,
                    	'content': `
                        <div class="font">
                            Hey, je m'apelle Victor Defauchy !

                            Bienvenue sur ce site statique qui est une simulation d'un terminal linux.
                            Tu peux naviguer à travers différents dossiers et ouvrir des fichiers ou des liens.
                            Ecris 'help', '?' ou 'h' pour afficher le menu d'aide et découvrir les commandes disponibles !

                            Si jamais je suis à la recherche d'un stage ! :-)
                        </div>
                    	`.replace(/\n/g, '<br />')
                    }
                ]
            };

    var availableCommands = {
        "about": {
             "req_args":[],
             "opt_args":[],
             "description":"A propose de ce terminal",
             "Utilisation":"about"
        },
        "cat": {
             "req_args":[
             	"fichier"
             ],
             "opt_args":[],
             "description":"Ouvre un fichier",
             "Utilisation":"cat [nom du fichier]"
        },
        "cd": {
             "req_args":[],
             "opt_args":[
                "dossier"
             ],
             "description":"Change de dossier",
             "Utilisation":"cd /[nom du dossier]"
        },
       "clear": {
             "req_args":[],
             "opt_args":[],
             "description":"Efface le terminal",
             "Utilisation":"clear"
        },
       "ls": {
             "req_args":[],
             "opt_args":[
                "dossier"
             ],
             "description":"Liste les fichiers et les dossiers",
             "Utilisation":"ls /[nom du dossier]"
        },
       "ll": {
             "req_args":[],
             "opt_args":[
                "dossier"
             ],
             "description":"Liste les fichiers et les dossiers",
             "Utilisation":"ll ./[nom du dossier]"
        },
        "help, h, ?": {
             "req_args":[],
             "opt_args":[],
             "description":"Affiche le menu d'aide",
             "Utilisation":"help"
        },
        "hostname": {
             "req_args":[],
             "opt_args":[],
             "description":"Montre le nom de l'administrateur système",
             "Utilisation":"hostname"
        },
        "ifconfig": {
             "req_args":[],
             "opt_args":[],
             "description":"Configure l'interface Internet",
             "Utilisation":"ifconfig"
        },
       "open": {
             "req_args":[
             	 "lien"
             	],
             "opt_args":[],
             "description":"Ouvre un lien",
             "Utilisation":"open [nom du lien / url]"
        },
       "pwd": {
             "req_args":[],
             "opt_args":[],
             "description":"Affiche le chemin du fichier actuel",
             "Utilisation":"pwd"
        },
       "theme": {
             "req_args":[],
             "opt_args":[
                "modern|interlaced|white"
             ],
             "description":"Affiche le theme acutel ou le modifie si un argument est spécifié",
             "Utilisation":"theme [theme voulu]"
        },
       "version": {
             "req_args":[],
             "opt_args":[],
             "description":"Montre la version actuel",
             "Utilisation":"version"
        },
        "whoami": {
             "req_args":[],
             "opt_args":[],
             "description":"Affiche le nom de l'utilisateur actuel",
             "Utilisation":"whoami"
        }
    }

    var _currentPwd = ['/'];

    _output.addEventListener('DOMSubtreeModified', function(e) {
        setTimeout(function() {
            _cmdLine.scrollIntoView();
        }, 0);
    }, false);

    if (options.welcome) {
        output(options.welcome);
    }

    window.addEventListener('click', function(e) {
        _cmdLine.focus();
    }, false);

    _output.addEventListener('click', function(e) {
        e.stopPropagation();
    }, false);

    _cmdLine.addEventListener('click', inputTextClick, false);
    _inputLine.addEventListener('click', function(e) {
        _cmdLine.focus();
    }, false);

    _cmdLine.addEventListener('keyup', historyHandler, false);
    _cmdLine.addEventListener('keydown', processNewCommand, false);

    window.addEventListener('keyup', function(e) {
        _cmdLine.focus();
        e.stopPropagation();
        e.preventDefault();
    }, false);

    function inputTextClick(e) {
        this.value = this.value;
    }

    function historyHandler(e) {
    	console.log(e.keyCode);
        if (e.keyCode == 27) {
            this.value = '';
            e.stopPropagation();
            e.preventDefault();
        }
        var TABKEY = 9;
	    if(e.keyCode == TABKEY) {
	        this.value += "    ";
	        if(e.preventDefault) {
	            e.preventDefault();
	        }
	        return false;
	    }

        if (_history.length && (e.keyCode == 38 || e.keyCode == 40)) {
            if (_history[_histpos]) {
                _history[_histpos] = this.value;
            }
            else {
                _histtemp = this.value;
            }

            if (e.keyCode == 38) {
                _histpos--;
                if (_histpos < 0) {
                    _histpos = 0;
                }
            }
            else if (e.keyCode == 40) {
                _histpos++;
                if (_histpos > _history.length) {
                    _histpos = _history.length;
                }
            }


            this.value = _history[_histpos] ? _history[_histpos] : _histtemp;

            this.value = this.value;
        }
    }

    function processNewCommand(e) {
        if (e.keyCode != 13) return;

        var cmdline = this.value;

        if (cmdline) {
            _history[_history.length] = cmdline;
            localStorage['history'] = JSON.stringify(_history);
            _histpos = _history.length;
        }

        var line = this.parentNode.parentNode.parentNode.parentNode.cloneNode(true);
        line.removeAttribute('id')
        line.classList.add('line');
        var input = line.querySelector('input.cmdline');
        input.autofocus = false;
        input.readOnly = true;
        input.insertAdjacentHTML('beforebegin', input.value);
        input.parentNode.removeChild(input);
        _output.appendChild(line);

        _inputLine.classList.add('hidden');

        this.value = '';

        if (cmdline && cmdline.trim()) {
            var args = cmdline.split(' ').filter(function(val, i) {
                return val;
            });
            var cmd = args[0];
            args = args.splice(1);
        }

        if (cmd) {
            var response = false;
            for (var index in extensions) {
                var ext = extensions[index];
                if (ext.execute) response = ext.execute(cmd, args);
                if (response !== false) break;
            }
            if (response === false) response = cmd + ': Commande inconnue ! ¯\\_(ツ)_/¯';
            output(response);
        }

        _prompt.innerHTML = options.prompt + '/' + _currentPwd.slice(1).join('/') + options.separator;
        _inputLine.classList.remove('hidden');
    }

    function parsePath(path, currentPwd) {
        path = path.replace(/[/]{2,}/,'/').replace(/[/]$/, '');
        var pwd = path.split('/');
        if (pwd[0] == '') pwd[0] = '/';
        else pwd = currentPwd.concat(pwd);

        for (var i = 0; i < pwd.length; i++) {
            value = pwd[i];
            if (value == '.' || (value == '..' && i == 1)) {
                pwd.splice(i, 1);
                i--;
            }
            else if (value == '..') {
                pwd.splice(i-1, 2);
                i -= 2;
            }
        }
        return pwd;
    }

    function outputListing(directory) {
        if (directory.type != fileType.DIRECTORY) return [directory.name];
        var output = [];
        directory.content.forEach(function (file) {
            if (file.type == fileType.LINK) {
                element = '<a href="' + file.content + '" class="external">' + file.name + '</a>';
            } else {
                element = '<span class="' + file.type + '">' + file.name + '</span>';
            }
            output.push(element);
        });
        return output;
    }

    function listDirectory(directory) {
        if (directory.type != fileType.DIRECTORY) return [directory.name];
        var output = [];
        directory.content.forEach(function (file) {
            output.push(file.name);
        });
        return output;
    }

    function fileType(directory) {
        return directory.type;
    }

    function getFile(path) {
        var directory = _fs;
        var directoryListing, indexOfFile;

        for (var i = 1; i < path.length; i++) {
            var element = path[i];
            if (directory.type !== fileType.DIRECTORY) return {'error': true, 'result': directory.name + ': Not a directory'};
            directoryListing = listDirectory(directory);
            indexOfFile = directoryListing.indexOf(element);
            if (indexOfFile > -1) {
                directory = directory['content'][indexOfFile];
            } else {
                return {'error': true, 'result': element + ': Fichier ou dossier inconnu ! ¯\\_(ツ)_/¯'};
            }
        }
        return {'error': false, 'result': directory};
    }

    function clear() {
        _output.innerHTML = '';
        _cmdLine.value = '';
        _background.style.minHeight = '';
    }

    function output(html) {
        _output.insertAdjacentHTML('beforeEnd', html);
    }

    return {
        clear: clear,
        displayHelp: function() {
        	var result = '<table class="help">';
        	var cmdName, cmdContent;

        	result += '<tr><td><span style="text-decoration: underline;">Commandes Disponibles</span></td><td><span style="text-decoration:underline;">Description</span></td></tr>';

        	Object.entries(availableCommands).forEach(function (content) {
        		cmdName = content[0];
        		cmdContent = content[1];
        		result += '<tr><td nowrap>';
        		result += '<b>' + cmdName + '</b>';
        		if (cmdContent['opt_args'].length > 0) {
        			result += ' [<i>';
        			result += cmdContent['opt_args'].join('] [');
        			result += '</i>]';
        		}
        		if (cmdContent['req_args'].length > 0) {
        			result += ' <i>';
        			result += cmdContent['req_args'].join(' ');
        			result += '</i>';
        		}
        		result += '</i></td><td width="100%">';
        		result += cmdContent['description'] + '<br />';
        		result += 'Utilisation: ' + cmdContent['Utilisation'];
        		result += '</td></tr>';
        	});
        	result += '</table>';
        	return result;
        },
        setPrompt: function(prompt) { _prompt.innerHTML = prompt + options.separator; },
        getPrompt: function() { return _prompt.innerHTML.replace(new RegExp(options.separator + '$'), ''); },
        setTheme: function(theme) { _terminal.classList.remove('terminal-' + options.theme); options.theme = theme; _terminal.classList.add('terminal-' + options.theme); },
        getTheme: function() { return options.theme; },
        listDirectory: function(directory) {
            var path = parsePath(directory, _currentPwd);
            var directory = getFile(path, _currentPwd);
            if (directory.error) return directory.result;
            return outputListing(directory.result).join('&nbsp;');
        },
        llistDirectory: function(directory) {
            var path = parsePath(directory, _currentPwd);
            var directory = getFile(path, _currentPwd);
            if (directory.error) return directory.result;
            return outputListing(directory.result).join('<br />');
        },
        changeDirectory: function(directory) {
            var path = parsePath(directory, _currentPwd);
            var directory = getFile(path, _currentPwd);
            if (directory.error) return directory.result;
            if (directory.result.type != fileType.DIRECTORY) return directory.result.name + ': Ce n\'est pas un dossier ! (づ｡◕‿‿◕｡)づ';
            _currentPwd = path;
            return '';
        },
        currentDirectory: function() { return '/' + _currentPwd.slice(1).join('/'); },
        catFile: function(file) {
            var path = parsePath(file, _currentPwd);
            var directory = getFile(path, _currentPwd);
            if (directory.error) return directory.result;
            if (directory.result.type == fileType.DIRECTORY) return directory.result.name + ': C\'est un dossier ! (づ｡◕‿‿◕｡)づ';
            return directory.result.content;
        },
        openFile: function(file) {
            var path = parsePath(file, _currentPwd);
            var directory = getFile(path, _currentPwd);
            if (directory.error) return directory.result;
            if (directory.result.type == fileType.DIRECTORY) return directory.result.name + ': C\'est un dossier ! (づ｡◕‿‿◕｡)づ';
            window.open(directory.result.content,'_blank');
            return ''
        }
    }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Terminal;

    } else {
        var oldTerminal = global.Terminal;
        Terminal.noConflict = function () {
            global.Terminal = oldTerminal;
            return Terminal;
        };
        global.Terminal = Terminal;
    }

})(this);

// Fin du code js de la page terminal
