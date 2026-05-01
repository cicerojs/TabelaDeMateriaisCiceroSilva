sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Dialog, Input, Button, Label, VBox, MessageToast, MessageBox, Fragment) => {
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
            this.getView().getModel("mNovoMaterial").setData([])
        },

        onSalvarMaterial: async function () {
            const oModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel("mNovoMaterial");
            const oMessageManager = sap.ui.getCore().getMessageManager();

            // limpa mensagens antigas
            oMessageManager.removeAllMessages();

            // Validações básicas
            const iNroMaterial = oViewModel.getProperty("/NumMat");
            const sNome = oViewModel.getProperty("/Nome");
            const sDescr = oViewModel.getProperty("/Descr");

            if (!iNroMaterial || !sNome || !sDescr) {
                MessageToast.show("Todos os campos são obrigatórios!");
                return;
            }

            const oNovoMaterial = {
                NumMat: iNroMaterial,
                Nome: sNome,
                Descr: sDescr
            };

            let oContext;   // limpa o contexto em caso de erro

            try {
                const listBinding = oModel.bindList("/Materiais");
                oContext = listBinding.create(oNovoMaterial);

                // Envia a requisição para o backend (executa o before CREATE)
                await oModel.submitBatch(oModel.getUpdateGroupId() || "$auto");

                // lê mensagens retornadas pelo CAP
                const aMessages = oMessageManager.getMessageModel().getData();
                const aErrors = aMessages.filter(m => m.type === "Error");

                if (aErrors.length > 0) {
                    MessageBox.error(aErrors[0].message, {
                        title: "Não foi possível criar o material",
                        styleClass: "sapUiSizeCompact"
                    });

                    //REMOVE o contexto que falhou
                    if (oContext) {
                        oContext.delete();
                    }
                    return;
                }

                // ====================== SUCESSO ======================
                MessageToast.show("Material criado com sucesso!");

                this.onCarregarMateriais();
                this._dialogNovoMaterial.close();
                oViewModel.setData({});
            } catch (oError) {
                console.log("Erro no submitBatch:", oError);
            }
        }
    });
});