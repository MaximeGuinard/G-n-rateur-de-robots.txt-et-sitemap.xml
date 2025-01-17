document.addEventListener('DOMContentLoaded', () => {
    // Gestionnaires d'événements pour l'ajout/suppression de règles robots.txt
    document.getElementById('addRule').addEventListener('click', addRobotRule);
    document.getElementById('generateRobots').addEventListener('click', generateRobotsTxt);

    // Gestionnaires d'événements pour l'ajout/suppression d'URLs sitemap
    document.getElementById('addUrl').addEventListener('click', addUrlEntry);
    document.getElementById('generateSitemap').addEventListener('click', generateSitemapXml);

    // Gestionnaire pour le téléchargement
    document.getElementById('downloadFile').addEventListener('click', downloadCurrentFile);

    // Ajouter les gestionnaires de suppression pour les entrées initiales
    document.querySelectorAll('.remove-rule').forEach(btn => {
        btn.addEventListener('click', e => e.target.closest('.rule-entry').remove());
    });

    document.querySelectorAll('.remove-url').forEach(btn => {
        btn.addEventListener('click', e => e.target.closest('.url-entry').remove());
    });
});

let currentFileContent = '';
let currentFileName = '';

function addRobotRule() {
    const ruleTemplate = `
        <div class="rule-entry">
            <select class="rule-type">
                <option value="Allow">Allow</option>
                <option value="Disallow">Disallow</option>
            </select>
            <input type="text" class="rule-path" placeholder="/chemin/">
            <button type="button" class="remove-rule">×</button>
        </div>
    `;
    const container = document.getElementById('robotRules');
    container.insertAdjacentHTML('beforeend', ruleTemplate);
    
    const newRule = container.lastElementChild;
    newRule.querySelector('.remove-rule').addEventListener('click', () => newRule.remove());
}

function addUrlEntry() {
    const urlTemplate = `
        <div class="url-entry">
            <input type="url" class="url-loc" placeholder="https://example.com/page" required>
            <input type="date" class="url-lastmod">
            <select class="url-changefreq">
                <option value="always">always</option>
                <option value="hourly">hourly</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
                <option value="never">never</option>
            </select>
            <select class="url-priority">
                <option value="1.0">1.0</option>
                <option value="0.9">0.9</option>
                <option value="0.8">0.8</option>
                <option value="0.7">0.7</option>
                <option value="0.6">0.6</option>
                <option value="0.5">0.5</option>
                <option value="0.4">0.4</option>
                <option value="0.3">0.3</option>
                <option value="0.2">0.2</option>
                <option value="0.1">0.1</option>
            </select>
            <button type="button" class="remove-url">×</button>
        </div>
    `;
    const container = document.getElementById('urlEntries');
    container.insertAdjacentHTML('beforeend', urlTemplate);
    
    const newEntry = container.lastElementChild;
    newEntry.querySelector('.remove-url').addEventListener('click', () => newEntry.remove());
}

function generateRobotsTxt() {
    const userAgent = document.getElementById('userAgent').value;
    const sitemapUrl = document.getElementById('sitemap').value;
    const rules = Array.from(document.querySelectorAll('.rule-entry')).map(entry => {
        const type = entry.querySelector('.rule-type').value;
        const path = entry.querySelector('.rule-path').value;
        return `${type}: ${path}`;
    });

    const robotsTxt = `User-agent: ${userAgent}
${rules.join('\n')}
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}`;

    currentFileContent = robotsTxt;
    currentFileName = 'robots.txt';
    document.getElementById('preview').textContent = robotsTxt;
}

function generateSitemapXml() {
    const urls = Array.from(document.querySelectorAll('.url-entry')).map(entry => {
        const loc = entry.querySelector('.url-loc').value;
        const lastmod = entry.querySelector('.url-lastmod').value;
        const changefreq = entry.querySelector('.url-changefreq').value;
        const priority = entry.querySelector('.url-priority').value;

        return `    <url>
        <loc>${escapeXml(loc)}</loc>
        ${lastmod ? `        <lastmod>${lastmod}</lastmod>` : ''}
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;
    });

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    currentFileContent = sitemapXml;
    currentFileName = 'sitemap.xml';
    document.getElementById('preview').textContent = sitemapXml;
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function downloadCurrentFile() {
    if (!currentFileContent || !currentFileName) {
        alert('Veuillez d\'abord générer un fichier');
        return;
    }

    const blob = new Blob([currentFileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}