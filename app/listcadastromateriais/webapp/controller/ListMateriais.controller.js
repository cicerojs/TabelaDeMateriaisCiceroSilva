sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Dialog, Input, Button, Label, VBox, MessageToast, Fragment) => {
    "use strict";

    return Controller.extend("listcadastromateriais.controller.ListMateriais", {
        onInit() {
            const oMaterialModel = new JSONModel({
                NumMat: "",
                Nome: "",
                Descr: ""
            });
            this.getView().setModel(oMaterialModel, "mNovoMaterial");

            const oFiltroMaterial = new JSONModel({
                qtde: ""
            });
            this.getView().setModel(oFiltroMaterial, "mFiltroMaterial");

            const oJsonModel = new sap.ui.model.json.JSONModel([]);
            this.getView().setModel(oJsonModel, "mMateriais");

            this.onCarregarMateriais();
            
        },

        onCarregarMateriais: async function () {
            const oModel = this.getOwnerComponent().getModel(),
                qtde = this.getView().getModel("mFiltroMaterial").getProperty("/qtde");
            let sPath = "";

            if (!qtde) {
                sPath = `/Materiais`
            } else {
                sPath = `/filtroMateriais(quantidade=${qtde})`
            }

            const oBinding = oModel.bindContext(sPath),
                oResult = await oBinding.requestObject();

            this.getView().getModel("mMateriais").setData(oResult.value);
        },

        onNovoMaterial: async function () {
            if (!this._dialogNovoMaterial) {
                this._dialogNovoMaterial = await Fragment.load({
                    name: "listcadastromateriais.view.fragments.NovoMaterial",
                    controller: this
                });
                this.getView().addDependent(this._dialogNovoMaterial);
            }
            this._dialogNovoMaterial.open();
        },

        onCancelarMaterial: function () {
            this._dialogNovoMaterial.close();
        },

        onSalvarMaterial: async function () {
            const oModel = this.getOwnerComponent().getModel();
            let iNroMaterial = this.getView().getModel("mNovoMaterial").getProperty("/NumMat"),
                sNnome = this.getView().getModel("mNovoMaterial").getProperty("/Nome"),
                sDescr = this.getView().getModel("mNovoMaterial").getProperty("/Descr");

            if (!iNroMaterial) {
                MessageToast.show("Número do material obrigatório");
                return;
            }
            if (!sNnome) {
                MessageToast.show("Número do material obrigatório");
                return;
            }
            if (!sDescr) {
                MessageToast.show("Número do material obrigatório");
                return;
            }

            const oNovoMaterial = {
                NumMat: iNroMaterial,
                Nome: sNnome,
                Descr: sDescr
            };

            try {
                const listBinding = oModel.bindList("/Materiais");
                const context = listBinding.create(oNovoMaterial);

                await context.created();
                MessageToast.show("Material criado");
                this.onCarregarMateriais();

            } catch (error) {
                let sMsg = "Erro ao criar material";

                if (error.responseText) {
                    try {
                        const oErr = JSON.parse(error.responseText);
                        sMsg = oErr.error.message;
                    } catch (e) { }
                }

                MessageBox.error(sMsg);
            }
        }
    });
});