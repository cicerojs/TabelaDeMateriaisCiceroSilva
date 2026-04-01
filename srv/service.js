const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    this.on('filtroMateriais', async (req) => {
        const { Materiais } = this.entities;
        const { quantidade } = req.data;

        const result = await SELECT.from(Materiais).limit(quantidade);
        return result;

    });

    this.before('CREATE', 'Materiais', async (req) => {

        // Gerar ID automático
        const result = await SELECT.one
            .from('empresaXPTO.Materiais')
            .columns('max(ID) as maxID');

        req.data.ID = (result?.maxID || 0) + 1;

        let existe = null;

        // Verificar se NumMat já existe
        existe = await SELECT.one
            .from('empresaXPTO.Materiais')
            .where({ NumMat: req.data.NumMat });

        if (existe !== null && existe !== undefined) {
            req.error({
                code: 409,
                message: `Material com o número ${req.data.NumMat} já existe!`,
                target: 'NumMat'
            });
        }

        existe = null;
    });

    this.on('CREATE', 'Materiais', async (req) => {
        const { Materiais } = this.entities;
        const { ID, NumMat, Nome, Descr } = req.data;

        const novoMaterial = {
            ID,
            NumMat,
            Nome,
            Descr
        };

        await INSERT.into(Materiais).entries(novoMaterial);
        return novoMaterial;
    });

});