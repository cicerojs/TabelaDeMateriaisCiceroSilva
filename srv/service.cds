using empresaXPTO from '../db/schema';

service MateriasSrv {
    entity Materiais as projection on empresaXPTO.Materiais;

    function filtroMateriais(quantidade : Integer) returns array of Materiais;

}