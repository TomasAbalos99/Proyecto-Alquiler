import { createRouter, createWebHistory } from "vue-router";

import PanelView from "../views/PanelView.vue";
import EquiposView from "../views/EquiposView.vue";
import ClientesView from "../views/ClientesView.vue";
import AlquileresView from "../views/AlquileresView.vue";

const routes = [
  { path: "/", name: "panel", component: PanelView },
  { path: "/equipos", name: "equipos", component: EquiposView },
  { path: "/clientes", name: "clientes", component: ClientesView },
  { path: "/alquileres", name: "alquileres", component: AlquileresView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
