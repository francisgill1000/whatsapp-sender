<template>
  <v-container fluid class="d-flex align-center justify-center" style="min-height: 100vh; background-color: #f5f5f5;">
    <v-card class="pa-5" max-width="400">
      <v-form
        ref="form"
        method="post"
        v-model="valid"
        lazy-validation
        autocomplete="off"
      >
        <h2 class="text-center mb-5 text-primary">My App</h2>

        <v-text-field
          label="Email"
          v-model="credentials.email"
          type="email"
          prepend-inner-icon="mdi-account"
          append-icon="mdi-at"
          outlined
          dense
          required
        ></v-text-field>

        <v-text-field
          label="Password"
          v-model="credentials.password"
          :type="show_password ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
          outlined
          dense
          @click:append="show_password = !show_password"
        ></v-text-field>

        <span v-if="msg" class="error--text text-center d-block my-2">
          {{ msg }}
        </span>

        <v-btn
          block
          color="primary"
          :loading="loading"
          class="mt-3"
          @click="login"
        >
          Login
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
<script>
export default {
  layout: "login",
  //  components: { ForgotPassword },
  data: () => ({
    dialogForgotPassword: false,
    maskMobileNumber: "",
    whatsappFormValid: true,
    logo: "/ideaHRMS-final-blue.svg",
    valid: true,
    loading: false,
    snackbar: false,
    snackbarMessage: "",

    show_password: false,
    msg: "",
    requiredRules: [(v) => !!v || "Required"],
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],

    passwordRules: [(v) => !!v || "Password is required"],

    dialogWhatsapp: false,
    otp: "",
    userId: "",
    credentials: {
      email: "admin",
      password: "admin",
    },
  }),
  created() {
    // this.$store.commit("dashboard/resetState", null);
    this.$store.dispatch("dashboard/resetState");
    this.$store.dispatch("resetState");

    this.verifyToken();
  },
  mounted() {
    // setTimeout(() => {
    //   window.location.reload();
    // }, 1000 * 60 * 15); //15 minutes
  },
  methods: {
    openForgotPassword() {
      this.dialogForgotPassword = true;
    },
    verifyToken() {
      if (this.$route.query.email && this.$route.query.password) {
        this.email = this.$route.query.email;
        this.password = this.$route.query.password;

        this.loginWithOTP();
      }
    },
    hideMobileNumber(inputString) {
      // Check if the input is a valid string
      if (typeof inputString !== "string" || inputString.length < 4) {
        return inputString; // Return input as is if it's not a valid string
      }

      // Use a regular expression to match all but the last 3 digits
      var regex = /^(.*)(\d{5})$/;
      var matches = inputString.match(regex);

      if (matches) {
        var prefix = matches[1]; // Text before the last 3 digits
        var lastDigits = matches[2]; // Last 3 digits
        var maskedPrefix = "*".repeat(prefix.length); // Create a string of asterisks of the same length as the prefix
        return maskedPrefix + lastDigits;
      } else {
        return inputString; // Return input as is if there are fewer than 3 digits
      }
    },

    login() {
      if (this.$refs.form.validate()) {
        this.msg = "";
        this.loading = true;
        this.$auth
          .loginWith("local", { data: this.credentials })
          .then(({ data }) => {})
          .catch(({ response }) => {
            if (!response) {
              return false;
            }
            let { status, data, statusText } = response;
            this.msg = status == 422 ? data.message : statusText;
            setTimeout(() => (this.loading = false), 2000);
          });
      } else {
        this.snackbar = true;
        this.snackbarMessage = "Invalid Emaild and Password";
      }
    },
  },
};
</script>
