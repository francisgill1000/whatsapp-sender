<template>
  <v-row>
    <v-col cols="12">
      <h3>
        Page Generator
        <v-icon @click="addItem" color="primary" dark>mdi-plus</v-icon>

        <v-icon @click="generatePage" color="primary" dark>mdi-floppy</v-icon>
      </h3>
    </v-col>
    <v-col>
      <v-card
        outlined
        v-for="(item, index) in menuItems"
        :key="index"
        class="my-1 pa-5"
      >
        <v-container>
          <v-row class="align-center">
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="item.name"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="item.icon"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="item.slug"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="text-right">
              <v-icon color="primary" @click="addSubItem(index)"
                >mdi-plus</v-icon
              >
              <v-icon color="red" @click="deleteItem(index)">mdi-delete</v-icon>
            </v-col>

            <v-col cols="12">
              <v-card
                class="my-1"
                outlined
                v-for="(subItem, subIndex) in item.subMenus"
                :key="subIndex"
              >
                <v-container>
                  <v-row class="align-center">
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="subItem.name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="subItem.icon"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="subItem.slug"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" class="text-right">
                      <v-icon
                        color="red"
                        @click="deleteSubItem(index, subIndex)"
                        >mdi-delete</v-icon
                      >
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
    <v-col v-if="menuItems.length">
      <v-card outlined class="my-1">
        <v-list dense>
          <!-- Loop through menus and their submenus -->
          <v-list-item-group v-for="(item, index) in menuItems" :key="index">
            <!-- Main Menu Item -->
            <v-list-item @click="toggleMenu(index)">
              <v-list-item-content>
                <v-list-item-title
                  ><v-icon small class="mr-2">{{ item.icon }}</v-icon
                  >{{ item.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- Submenus (if any) -->
            <v-expand-transition>
              <v-list v-if="item.open" dense class="pl-5">
                <v-list-item
                  v-for="(subItem, subIndex) in item.subMenus"
                  :key="subIndex"
                >
                  <v-list-item-content>
                    <v-list-item-title
                      ><v-icon small class="mr-2">{{ subItem.icon }}</v-icon
                      >Label: {{ subItem.name }} Slug:
                      {{ subItem.slug }}</v-list-item-title
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expand-transition>
          </v-list-item-group>
        </v-list>
      </v-card>
      <ul>
        <li v-for="(response, index) in responses" :key="index">
          {{ response }}
        </li>
      </ul>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      responses: [],
      message: null,
      // Menu structure with form fields for each submenu
      menuItems: [],
      // Rules for validation of text fields
      textFieldRules: [(v) => !!v || "This field is required"],
      existingId: 0,
    };
  },
  async created() {
    await this.getMenus();
  },
  methods: {
    deleteSubItem(index, subIndex) {
      this.menuItems[index][`subMenus`].splice(subIndex, 1);
    },
    deleteItem(index) {
      this.menuItems.splice(index, 1);
    },
    addSubItem(index) {
      let nextElement = this.menuItems[index].subMenus.length + 1;
      this.menuItems[index][`subMenus`].push({
        name: "Child Menu " + nextElement,
        icon: "mdi-home",
        slug: "page",
      });
    },

    addItem() {
      this.menuItems.push({
        name: "Parent Menu",
        icon: "mdi-order-bool-descending",
        slug: "parent slug",
        open: true,
        subMenus: [
          {
            name: "Child Menu",
            icon: "mdi-order-bool-descending",
            slug: "slug",
          },
        ],
      });
    },
    toggleMenu(index) {
      // Toggle the open state of the selected menu
      this.$set(this.menuItems, index, {
        ...this.menuItems[index],
        open: !this.menuItems[index].open,
      });
    },

    async generatePage() {
      try {
        let payload = { id: this.existingId, json: this.menuItems };
        await this.$axios.post("/menus", payload);
        await this.generateNuxtPages(this.menuItems.flatMap((e) => e.slug));
        await this.generateNuxtPages(
          this.menuItems.flatMap((e) => e.subMenus.map((i) => i.slug))
        );
      } catch (error) {
        console.log(
          error.response?.data?.message || "Failed to generate page."
        );
      }
    },

    async generateNuxtPages(slugs) {
      console.log("🚀 ~ generateNuxtPages ~ slugs:", slugs);
      slugs.forEach(async (e) => {
        try {
          let url = "http://localhost:3007/api/generate-page";
          const { data } = await this.$axios.post(url, { pageName: e });
          this.responses.push(data.message);
        } catch (error) {
          this.responses.push(
            error.response?.data?.message || "Failed to generate page."
          );
        }
      });
    },
    async getMenus() {
      try {
        const { data } = await this.$axios.get("/menus");

        if (data) {
          this.menuItems = data.json;
          this.existingId = data.id;
        }
      } catch (error) {
        console.log(
          error.response?.data?.message || "Failed to generate page."
        );
      }
    },
  },
};
</script>
