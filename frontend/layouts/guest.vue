<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Guest Layout</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer app color="primary" dark>
      <v-col class="text-center white--text">
        © {{ new Date().getFullYear() }} - Guest Layout Footer
      </v-col>
    </v-footer>
  </v-app>
</template>
