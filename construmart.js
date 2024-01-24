const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function quitarTildes(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function scrapConstrumart (region, comuna, fecha){
    let day = fecha.getDate(); // Día del mes
    let month = fecha.getMonth() + 1; // Mes (Enero es 0)
    let year = fecha.getFullYear(); // Año
    let fechaFormateada = `${year}${month}${day}`
    const path_csv = 'datos_'+comuna.toLowerCase().replace(/\ /g, '_')+'_'+fechaFormateada+'.csv'

    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.setViewport({width:1920, height: 1080});
    await page.goto("https://www.construmart.cl/maderas-y-tableros");
    await page.waitForSelector('.form-group');
    await page.select('#region', region)
    await page.select('#tienda', comuna)
    await page.click('.storeSelectorButton')

    const selector_precio = 'span.vtex-product-price-1-x-sellingPrice>span.vtex-product-price-1-x-sellingPriceValue--summary';
    const selector_nombre = '.vtex-product-summary-2-x-productNameContainer'
    const selector_links = 'a.vtex-product-summary-2-x-clearLink'

    await page.waitForSelector('strong.construmartcl-custom-apps-0-x-triggerSelectedStore');
    await page.waitForSelector('#gallery-layout-container')

    const links = await page.evaluate(selector => {
        const elementos = Array.from(document.querySelectorAll(selector));
        return elementos.map(elemento => elemento.href);
    }, selector_links);
    const precios = await page.evaluate(selector => {
        const elementos = Array.from(document.querySelectorAll(selector));
        return elementos.map(elemento => elemento.innerText.replace(/\./g, ''));
    }, selector_precio);
    const textos = await page.evaluate(selector => {
        const elementos = Array.from(document.querySelectorAll(selector));
        return elementos.map(elemento => elemento.innerText);
    }, selector_nombre);

    const datosCombinados = links.map((link, index) => ({
        link,
        precio: precios[index] || '', 
        texto: quitarTildes(textos[index]) || '',
        fecha_extraccion: fecha.toISOString() || '',
        region: quitarTildes(region) || '',
        comuna: comuna || ''
    }));
    
    const csvData = createCsvWriter({
        path: path_csv,
        header: [
            { id: 'link', title: 'Link' },
            { id: 'precio', title: 'Precio' },
            { id: 'texto', title: 'Texto' },
            { id: 'fecha_extraccion', title: 'Fecha'},
            { id: 'region', title: 'Region'},
            { id: 'comuna', title: 'Comuna'}
        ],
    });

    csvData.writeRecords(datosCombinados)
        .then(() => {
            console.log('El archivo CSV: '+ path_csv + ' se creo correctamente.');
        })
        .catch((error) => {
            console.error('Error writing CSV file:', error);
        });
    
    
    await browser.close()
};

module.exports = scrapConstrumart