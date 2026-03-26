// Début du programme js de l'analyseur de messages

// Boutons de la page 
const buttons = [
    { id: 'terminal', url: 'index.html' },
    { id: 'simple', url: 'simple.html' },
    { id: 'hacking', url: 'hackingToolBox.html' },
    { id: 'how', url: 'public/IMG/how.jpg' },
    { id: 'doc', url: 'public/PDF/Documentation.pdf' },
    { id: 'python', url: 'public/ZIP/Analyseur.zip' }
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

document.getElementById('resetButton').addEventListener('click', function() {
    location.reload();
});

let analyse = false; 

// Analyse
document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();

    if (analyse) {
        alert("Erreur : une analyse est déjà en cours !");
        location.reload();
        return;
    }

    analyse = true;

    try {
        const nom = document.getElementById('nom').value;
        const exp = document.getElementById('exp').value;
        const fileInput = document.getElementById('fileInput');
        const files = fileInput.files[0];
        const extension = files.name.split('.').pop().toLowerCase();

        if (!fileInput.files.length) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }

        if (extension !== 'txt') {
            alert("Erreur : fichier texte uniquement !");
            location.reload();
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lignes = text.split('\n'); 
                const lignesCount = lignes.length;
                const messagePattern = /^(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}) - ([^:]*): /;
                const messagePatternBis = /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} - .+:/;
                const expediteurs = new Set();

                console.log("Lignes comptées:", lignesCount);

                if (lignesCount === 0) {
                    alert("Erreur : le fichier ne peut pas être vide !");
                    location.reload();
                    return;
                }

                if (lignesCount < 2 && lignesCount !== 0) {
                    alert("Erreur : le fichier ne contient pas assez de lignes !");
                    location.reload();
                    return;
                }

                if (lignesCount < 100) {
                    const continue_100 = confirm("Attention ! Votre conversation comporte moins de 100 messages ! Une conversation avec trop peu de messages ne donnera pas de résultats concrets.\nVoulez-vous quand même lancer l'analyse ?");
                    if (!continue_100) {
                        alert("Analyse stoppée !");
                        location.reload();
                        return;
                    }
                }

                if (lignesCount > 10000) {
                    const continue_10000 = confirm("Attention ! Votre conversation comporte plus de 10 000 messages ! Une conversation avec autant de messages peut amener certains graphiques à ne pas se créer et peut mettre du temps à charger !\nVoulez-vous quand même lancer l'analyse ?");
                    if (!continue_10000) {
                        alert("Analyse stoppée !");
                        location.reload();
                        return;
                    }
                }

                const deuxiemeLigne = lignes[1].trim();

                if (!messagePatternBis.test(deuxiemeLigne)) {
                    alert("Erreur : votre fichier de conversation ne respecte pas le format 'JJ/MM/AAAA, HH:MM - Expéditeur:' !");
                    location.reload();
                    return;
                }

                for (const line of lignes) {
                    const match = messagePattern.exec(line); 
                    if (match) {
                        const sender = match[3].trim(); 
                        expediteurs.add(sender); 
                    }
                }

                if (!expediteurs.has(nom)) {
                    alert(`Erreur : le nom '${nom}' ne fait pas partie des expéditeurs !`);
                    location.reload();
                    return;
                }

                analyzeText(text, nom, exp);
            } catch (innerError) {
                alert(`Erreur : une erreur inconnue est survenue (innerError) : \n'${innerError.message}'`);
                location.reload();
            }
        };

        reader.readAsText(files);

    } catch (error) {
        alert(`Erreur : une erreur inconnue est survenue (error) : \n'${error.message}'`);
        location.reload();
    }
});


function analyzeText(text, nom, exp) {
    // Initialisation des variables
    let media = 0;
    let rire = 0;
    let dest = 0;
    let liens = 0;
    let liensDebiles = 0;
    let longueurLigne = [];
    let totalMessages = 0;
    let longestMessage = "";
    let maxLength = 0;
    let currentMessage = [];
    let previousTimestamp = null;
    let conversations = [];
    let currentConversation = [];
    let longestConversationLength = 0;
    let longestConversation = [];
    let dateMessageCountsMoi = {};
    let dateMessageCountsExp = {};
    let dateMessageCountsTotal = {};
    let hourMessageCountsMoi = {}
    let hourMessageCountsExp = {}
    let hourMessageCountsTotal = {}
    let firstMessage = "";
    let lastMessage = "";
    let modifie = 0;
    let auto = 0;
    let fullText = '';

    const messageCountsByDestinataire = {};

    // Regex
    const messagePattern = /^(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}) - ([^:]*): /;
    const dateFormat = "DD/MM/YYYY, HH:mm";
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const autoMessagePattern = /^(.* a (Vous|remplacé|ajouté|supprimé|changé).*)$/;

    const lines = text.split('\n');

    lines.forEach(line => {
        const match = messagePattern.exec(line);
        if (match) {
            const sender = match[3].trim();

            if (!messageCountsByDestinataire[sender]) {
                messageCountsByDestinataire[sender] = 0;
            }
    
            messageCountsByDestinataire[sender] += 1;

            if (currentMessage.length) {
                const messageText = currentMessage.join(' ').trim();
                longueurLigne.push(messageText.length);
                analyzeMessage(messageText);
                fullText += messageText + '\n';
                currentMessage = [];
                totalMessages++;
            }

            if (!firstMessage) {
                firstMessage = line.trim();
            }

            processConversation(line);
            currentMessage.push(line.trim());
        } else {
            currentMessage.push(line.trim());
        }
    });

    const messageText = currentMessage.join(' ').trim();
    if (messageText.length) {
        longueurLigne.push(messageText.length);
        analyzeMessage(messageText);
        fullText += messageText + '\n';
        totalMessages++;
        if (!lastMessage) {
            lastMessage = messageText;
        }
    }

    // Tous les messages filtrés
    let messageContent = fullText;
    messageContent = messageContent.replace(messagePattern, "").trim();
    messageContent = messageContent.replace(urlPattern, "").trim();
    messageContent = messageContent.replace(/<Médias omis>/g, "").trim();
    messageContent = messageContent.replace(/Ce message a été supprimé\./g, "").trim();
    messageContent = messageContent.replace(/Vous avez supprimé ce message/g, "").trim();
    messageContent = messageContent.replace(/<Ce message a été modifié>/g, "").trim();

    function analyzeMessage(message) {
        if (autoMessagePattern.test(message) || message.includes("Les messages et les appels sont chiffrés de bout en bout. Aucun tiers, pas même WhatsApp, ne peut les lire ou les écouter. Appuyez pour en savoir plus.")) {
            auto += 1;
            return; // Ignore ce message
        }
        if (message.includes("<Médias omis>")) {
            media++;
        }
        if (message.includes("😂")) {
            rire++;
        }
        if (message.includes(nom)) {
            dest++;
        }
        if (/instagram\.com/.test(message) || /facebook\.com/.test(message) || /youtube\.com/.test(message) || /m\.youtube\.com/.test(message)) {
            liensDebiles++;
        }
        if (message.includes("<Ce message a été modifié>")) {
            modifie++;
        } 
        const links = message.match(urlPattern) || [];
        liens += links.length;

        let messageContent = message.replace(messagePattern, "").trim();

        const messageLength = messageContent.length;
        if (messageLength > maxLength) {
            maxLength = messageLength;
            longestMessage = messageContent;
        }
    }

    function addMessageToConversation(message) {
        currentConversation.push(message);
    }

    function endConversation() {
        if (currentConversation.length) {
            conversations.push([...currentConversation]);
            const conversationLength = currentConversation.reduce((sum, msg) => sum + msg.length, 0);
            if (conversationLength > longestConversationLength) {
                longestConversationLength = conversationLength;
                longestConversation = [...currentConversation];
            }
            currentConversation = [];
        }
    }

    function processConversation(line) {
        const match = messagePattern.exec(line);
        if (match) {
            const timestampStr = `${match[1]}, ${match[2]}`;
            const currentTimestamp = moment(timestampStr, dateFormat);
            const sender = match[3].trim();
            
            if (previousTimestamp) {
                if (currentTimestamp.diff(previousTimestamp, 'seconds') > 3600) {
                    endConversation();
                }
            }

            previousTimestamp = currentTimestamp;
            addMessageToConversation(line.trim());

            const date = currentTimestamp.format('YYYY-MM-DD');
            const hour = currentTimestamp.format('HH:00:00');

            dateMessageCountsTotal[date] = (dateMessageCountsTotal[date] || 0) + 1;
            hourMessageCountsTotal[hour] = (hourMessageCountsTotal[hour] || 0) + 1;

            if (sender === nom) {
                dateMessageCountsMoi[date] = (dateMessageCountsMoi[date] || 0) + 1;
                hourMessageCountsMoi[hour] = (hourMessageCountsMoi[hour] || 0) + 1;
            } else {
                dateMessageCountsExp[date] = (dateMessageCountsExp[date] || 0) + 1;
                hourMessageCountsExp[hour] = (hourMessageCountsExp[hour] || 0) + 1;
            }

            previousTimestamp = currentTimestamp;
        } else {
            addMessageToConversation(line.trim());
        }
    }

    // Résultats

    function displayResults(messageCountsByDestinataire) {
    const moyenneLongueur = longueurLigne.reduce((a, b) => a + b, 0) / longueurLigne.length;
    const minMessages = Math.min(...Object.values(messageCountsByDestinataire));
    const leastActivePerson = Object.keys(messageCountsByDestinataire).find(key => messageCountsByDestinataire[key] === minMessages);
    const numberOfParticipants = Object.keys(messageCountsByDestinataire).length;

    let stats = '';
    if (numberOfParticipants <= 2) {
        stats += `<h2>--- Statistiques de la conversation avec ${exp} ---</h2>`;
    } else {
        stats += `<h2>--- Statistiques de la conversation du groupe ${exp} ---</h2>`;
    }

    stats += `
        <p>Nombre total de messages : ${totalMessages} messages</p>
        <p>Nombre de personnes dans la conversation : ${numberOfParticipants} personnes</p>
        <p>Nombre de messages envoyés par chaque personne :</p>
        <ul>
    `;
    for (const [destinataire, count] of Object.entries(messageCountsByDestinataire)) {
        stats += `<li>${destinataire} : ${count} messages</li>`;
    }
    stats += `</ul>
        <p>La personne qui parle le moins : ${leastActivePerson} avec ${minMessages} messages</p>
        <p>Nombre de messages automatiques : ${auto} messages</p>
        <p>Nombre de messages modifiés : ${modifie} messages</p>
        <p>Nombre total de médias : ${media} médias</p>
        <p>Nombre total de liens : ${liens} liens</p>
        <p>Nombre total de liens youtube, instas ou facebook : ${liensDebiles} liens</p>
        <p>Nombre total d'emojies rires : ${rire} emojies</p>
        <p>Premier message : ${firstMessage}</p>
        <p>Dernier message : ${lastMessage}</p>
        <p>Longueur moyen d'un message : ${Math.round(moyenneLongueur)} caractères</p>
        <p>Longueur du message le plus long : ${Math.max(...longueurLigne)} caractères</p>
        <p>Message le plus long : 
            <span class="tooltip">?
                <span class="tooltiptext">Faites dérouler pour voir l'intégralité du message</span>
            </span> <pre>${longestMessage}</pre></p>
        <p>Nombre total de conversations : ${conversations.length} conversations</p>
        <p>Nombre moyen de messages par conversation : ${Math.round((totalMessages) / conversations.length)} messages</p>
        <p>Longueur de la plus longue conversation : ${longestConversationLength} caractères</p>
        <p>Nombre de messages dans la plus longue conversation : ${longestConversation.length} messages</p>
        <p>Conversation la plus longue : 
            <span class="tooltip">?
                <span class="tooltiptext">Faites dérouler pour voir l'intégralité de la conversation</span>
            </span> <pre>${longestConversation.join('\n')}</pre></p>
        <p>\n\nCi-dessous, les graphiques du nombre de messages par date, du nombre de message par heure et le WordCloud des mots les plus fréquents.</p>
    `;

    function getWordFrequencies(text) {
        const stopWords = new Set(['sa', 'notre', 'ayants', 'ayant', 's', 'pour', 'les', 'ayez', 'y', 'seriez', 'furent', 'même', 'pas', 'fussions', 'étées', 'avait', 't', 'nos', 'étés', 'qui', 'ses', 'tu', 'étée', 'aie', 'eue', 'aurez', 'serions', 'êtes', 'étions', 'moi', 'fut', 'étante', 'serons', 'le', 'eussiez', 'nous', 'eût', 'aurait', 'avons', 'étants', 'ne', 'étais', 'ou', 'seraient', 'aient', 'mon', 'votre', 'du', 'c', 'aura', 'avaient', 'ont', 'auriez', 'sont', 'elle', 'ces', 'auraient', 'des', 'avec', 'à', 'mais', 'été', 'par', 'fûmes', 'et', 'ai', 'fût', 'eu', 'fusse', 'se', 'ce', 'eus', 'es', 'serai', 'serait', 'toi', 'eûmes', 'ayons', 'sommes', 'eussent', 'ma', 'ton', 'aux', 'tes', 'étaient', 'soyons', 'ayante', 'aurai', 'dans', 'étantes', 'as', 'eux', 'te', 'ayantes', 'au', 'on', 'aurions', 'de', 'aurais', 'en', 'mes', 'eusses', 'serais', 'soyez', 'avez', 'sera', 'était', 'fussiez', 'm', 'sois', 'auront', 'seront', 'eurent', 'fussent', 'me', 'une', 'serez', 'l', 'étant', 'suis', 'leur', 'j', 'eues', 'fusses', 'seras', 'aurons', 'lui', 'la', 'que', 'soient', 'eussions', 'son', 'étiez', 'fûtes', 'je', 'est', 'eûtes', 'ta', 'il', 'eut', 'sur', 'qu', 'fus', 'un', 'soit', 'auras', 'aies', 'ait', 'vos', 'aviez', 'avais', 'n', 'ils', 'vous', 'eusse', 'd', 'avions']);
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const filteredWords = words.filter(word => !stopWords.has(word) && word.length > 2 && isNaN(word));
        const wordCounts = filteredWords.reduce((counts, word) => {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {});
    
        return Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 100).map(([word, count]) => [word, count]);
    }
    
    const wordFrequencies = getWordFrequencies(messageContent);
    generateWordCloud(wordFrequencies);

    document.getElementById('stats').innerHTML = stats;
    generateChartUn();
    generateChartDeux();
}

    function generateChartUn() {
        const dates = Object.keys(dateMessageCountsTotal).sort();
        const messageCountsTotal = dates.map(date => dateMessageCountsTotal[date]);
        const messageCountsMoi = dates.map(date => dateMessageCountsMoi[date] || 0);
        const messageCountsExp = dates.map(date => dateMessageCountsExp[date] || 0);

        const ctx = document.getElementById('messageChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: `Messages de ${nom}`,
                        data: messageCountsMoi,
                        borderColor: 'blue',
                        fill: false
                    },
                    {
                        label: `Messages de ${exp}`,
                        data: messageCountsExp,
                        borderColor: 'red',
                        fill: false
                    },
                    {
                        label: 'Total des messages',
                        data: messageCountsTotal,
                        borderColor: 'black',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nombre de messages'
                        }
                    }
                }
            }
        });
    }

    function generateChartDeux() {
        const hours = Object.keys(hourMessageCountsTotal).sort();
        const totalCounts = hours.map(hour => hourMessageCountsTotal[hour] || 0);
        const moiCounts = hours.map(hour => hourMessageCountsMoi[hour] || 0);
        const expCounts = hours.map(hour => hourMessageCountsExp[hour] || 0);

        const ctx = document.getElementById('messagesPerHourChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [
                    {
                        label: `Messages de ${nom}`,
                        data: moiCounts,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: `Messages de ${exp}`,
                        data: expCounts,
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Total Messages',
                        data: totalCounts,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Heure'
                        },
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nombre de Messages'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function generateWordCloud(words) {
        const wordCloudElement = document.getElementById('wordCloud');
        const wordInfoElement = document.getElementById('wordInfo');        
    
        WordCloud(wordCloudElement, {
            list: words,
            color: 'random-light',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fontFamily: 'Arial, sans-serif',
            maxSize: 10,
            padding: 5,
            hover: (word, weight, x, y, ) => {
                if (word && weight) {
                    wordInfoElement.textContent = `${word} occurrences`;
                    wordInfoElement.style.display = 'block';
                    wordInfoElement.style.left = `${x + 10}px`;
                    wordInfoElement.style.top = `${y + 10}px`; 
                }
            },
        });
    
        wordCloudElement.addEventListener('mouseleave', () => {
            wordInfoElement.style.display = 'none';
        });
    }
    
// Téléchargement des rapports 
    document.getElementById('downloadReport').addEventListener('click', function() {
        const totalMessages = Object.values(messageCountsByDestinataire).reduce((a, b) => a + b, 0);
        const moyenneLongueur = longueurLigne.reduce((a, b) => a + b, 0) / longueurLigne.length;
        const minMessages = Math.min(...Object.values(messageCountsByDestinataire));
        const leastActivePerson = Object.keys(messageCountsByDestinataire).find(key => messageCountsByDestinataire[key] === minMessages);
        const numberOfParticipants = Object.keys(messageCountsByDestinataire).length;
    
        let reportContent = '';
        if (numberOfParticipants <= 2) {
            reportContent += `--- Statistiques de la conversation avec ${exp} ---`;
        } else {
            reportContent += `--- Statistiques de la conversation du groupe ${exp} ---`;
        }
        
        // Les statistiques sont écrites dans le rapport comme dans une balise pre
        reportContent += `
Nombre total de messages : ${totalMessages}\n\n
Nombre de personnes dans la conversation : ${numberOfParticipants} personnes\n\n
Nombre de messages envoyés par chaque personne :\n\n`;
    
        for (const [destinataire, count] of Object.entries(messageCountsByDestinataire)) {
            reportContent += `${destinataire} : ${count} messages\n`;
        }
    
        reportContent += `\nLa personne qui parle le moins dans cette conversation est ${leastActivePerson} avec ${minMessages} messages.\n\n`;
    
        reportContent += `
Nombre de messages automatiques : ${auto} messages
Nombre de messages modifiés : ${modifie} messages
Nombre total de médias : ${media} médias\n\n
Nombre total de liens : ${liens} liens\n\n
Nombre total de liens débiles : ${liensDebiles} liens\n\n
Nombre total d'emojies rires : ${rire} emojies\n\n
Premier message : ${firstMessage}\n\n
Dernier message : ${lastMessage}\n\n
Longueur moyen d'un message : ${Math.round(moyenneLongueur)} caractères\n\n
Longueur du message le plus long : ${Math.max(...longueurLigne)} caractères\n\n
Message le plus long : ${longestMessage}\n\n
Nombre total de conversations : ${conversations.length} conversations\n\n
Nombre moyen de messages par conversation : ${Math.round((totalMessages) / conversations.length)} messages
Longueur de la plus longue conversation : ${longestConversationLength} caractères\n\n
Nombre de messages dans la plus longue conversation : ${longestConversation.length} messages\n\n
Conversation la plus longue :\n${longestConversation.join('\n')}\n\n
        `;
    
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_conv_${nom}_${exp}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('downloadChart').addEventListener('click', function() {
        // Récupérez les éléments canvas pour chaque graphique
        const charts = [
            { id: 'messageChart', fileName: `messages_par_date_${nom}_${exp}.png` },
            { id: 'messagesPerHourChart', fileName: `messages_par_heures_${nom}_${exp}.png` },
            { id: 'wordCloud', fileName: `wordcloud_${nom}_${exp}.png` }
        ];
    
        // Téléchargez chaque graphique
        charts.forEach(chart => {
            const canvas = document.getElementById(chart.id);
            if (canvas) {
                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = chart.fileName;
                // Simulez un clic pour initier le téléchargement
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    });
    

    displayResults(messageCountsByDestinataire);
}

// Fin du programme js de l'analyseur de messages