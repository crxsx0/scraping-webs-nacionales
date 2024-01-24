const scrapConstrumart = require('./construmart')

const fecha_extraccion = new Date().toISOString()
const region = 'XIII REGIÓN METROPOLITANA DE SANTIAGO'
const comuna = 'LAS CONDES'

scrapConstrumart(region, comuna, fecha_extraccion);
scrapConstrumart('I TARAPACÁ', 'IQUIQUE', fecha_extraccion)