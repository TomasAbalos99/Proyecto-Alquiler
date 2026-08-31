<script setup>
</script>

<template>
  <div id="layout">
    <nav>
      <router-link to="/">Panel</router-link>
      <router-link to="/equipos">Equipos</router-link>
      <router-link to="/clientes">Clientes</router-link>
      <router-link to="/alquileres">Alquileres</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>
