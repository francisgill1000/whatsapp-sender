<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer app class="primary" dark>
      <v-container class="d-flex" style="align-items: center">
        <v-avatar color="red" size="40">
          <span class="white--text">CJ</span>
        </v-avatar>
        <div class="white--text ml-2">My Application</div>
      </v-container>
      <v-divider></v-divider>
      <v-list dense class="pa-0">
        <v-list-item to="/">
          <v-list-item-content>
            <v-list-item-title
              ><v-icon small class="mr-2">mdi-home</v-icon>
              Home</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/bridge">
          <v-list-item-content>
            <v-list-item-title
              ><v-icon small class="mr-2">mdi-package</v-icon>
              Bridge</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- <v-list dense>
        <v-list-item-group v-for="(item, index) in menuItems" :key="index">
          <v-list-item @click="toggleMenu(index, item.slug)">
            <v-list-item-content>
              <v-list-item-title
                ><v-icon small class="mr-2">{{ item.icon }}</v-icon
                >{{ item.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-expand-transition>
            <v-list v-if="item.open" dense class="pl-5">
              <v-list-item
                v-for="(subItem, subIndex) in item.subMenus"
                :key="subIndex"
                :to="subItem.slug"
              >
                <v-list-item-content>
                  <v-list-item-title
                    ><v-icon small class="mr-2">{{ subItem.icon }}</v-icon
                    >{{ subItem.name }}</v-list-item-title
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expand-transition>
        </v-list-item-group>
      </v-list> -->
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-toolbar>
        My App
        <v-spacer></v-spacer>
        <v-icon @click="logout">mdi-logout</v-icon>
      </v-toolbar>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      // Menu structure with submenus
      menuItems: [
        // {
        //   name: "Main Menu",
        //   icon: "mdi-order-bool-descending",
        //   open: false,
        //   subMenus: [
        //     { name: "Child Menu 1", icon: "mdi-order-bool-descending" },
        //     { name: "Child Menu 2", icon: "mdi-order-bool-descending" },
        //     { name: "Child Menu 3", icon: "mdi-order-bool-descending" },
        //   ],
        // },
        // {
        //   name: "Another Menu",
        //   icon: "mdi-order-bool-descending",
        //   open: false,
        //   subMenus: [
        //     { name: "Child Menu A", icon: "mdi-order-bool-descending" },
        //     { name: "Child Menu B", icon: "mdi-order-bool-descending" },
        //   ],
        // },
        // {
        //   name: "Settings",
        //   icon: "mdi-order-bool-descending",
        //   open: false,
        //   subMenus: [
        //     { name: "Profile Settings", icon: "mdi-order-bool-descending" },
        //     { name: "Account Settings", icon: "mdi-order-bool-descending" },
        //   ],
        // },
      ],
    };
  },
  async created() {
    await this.getMenus();
  },
  methods: {
    async getMenus() {
      try {
        const { data } = await this.$axios.get("/menus");

        if (data) {
          this.menuItems = data.json;
        }
      } catch (error) {
        console.log(
          error.response?.data?.message || "Failed to generate page."
        );
      }
    },
    toggleMenu(index, slug) {
      // Toggle the open state of the selected menu
      this.$set(this.menuItems, index, {
        ...this.menuItems[index],
        open: !this.menuItems[index].open,
      });

      if (this.menuItems[index].subMenus.length == 0) {
        this.$router.push(slug);
      }
    },

    async logout() {

      await this.$auth.logout();

      this.$router.push("/login");
    },
  },
};
</script>
