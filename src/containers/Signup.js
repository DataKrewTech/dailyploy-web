import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import "../assets/css/signup.scss";
import { signUp } from "../utils/API";
import {
  checkPassword,
  validateName,
  validateEmail
} from "../utils/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tabs, Tab } from "react-bootstrap";
import Company from "../components/Signup/Company";
import Individual from "../components/Signup/Individual";
import Header from "../components/Landing/Header";
import signup from "../assets/images/signup.jpg";
import googleIcon from "../assets/images/google.png";

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
      errors: {
        nameError: null,
        companyNameError: null,
        emailError: null,
        passwordError: null,
        confirmPasswordError: null
      },
      isCompany: false
    };
  }

  companyFlag = word => {
    var company;
    if (word === "company") {
      company = true;
    } else {
      company = false;
    }
    console.log("company", word);
    return this.setState({ isCompany: company });
  };

  changeHandler = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  signupForm = async () => {
    this.validateAllInputs();
    if (this.validityCheck()) {
      var signupData;
      if (this.state.isCompany === true) {
        signupData = {
          user: {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.confirmPassword,
            is_company_present: this.state.isCompany,
            company: {
              name: this.state.companyName,
              email: this.state.email
            }
          }
        };
      } else {
        signupData = {
          user: {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.confirmPassword,
            is_company_present: this.state.isCompany
          }
        };
        console.log("is_company_present:", this.state.isCompany);
      }
      try {
        const { signUpData } = await signUp(signupData);
        toast.success("User Created", { autoClose: 2000 });
        this.props.history.push("/login");
      } catch (e) {
        toast.error("email " + e.response.data.errors.email, {
          autoClose: 2000
        });
      }
    } else {
      console.log("Enter valid email address and password");
    }
  };

  validatePassword = (password, confirmPassword) => {
    if (password === confirmPassword) {
      return;
    }
    return "Didn't Match, Try Again.";
  };

  validateAllInputs = () => {
    const errors = {
      nameError: null,
      companyNameError: null,
      emailError: null,
      passwordError: null,
      confirmPasswordError: null
    };
    errors.nameError = validateName(this.state.name);
    errors.passwordError = checkPassword(this.state.password);
    errors.emailError = validateEmail(this.state.email);
    errors.confirmPasswordError = this.validatePassword(
      this.state.password,
      this.state.confirmPassword
    );
    this.setState({ errors });
  };

  validityCheck = () => {
    return (
      this.state.name &&
      this.state.email &&
      this.state.password &&
      this.state.confirmPassword &&
      this.state.password === this.state.confirmPassword
    );
  };

  render() {
    const isEnabled =
      this.state.name &&
      this.state.email &&
      this.state.password &&
      this.state.confirmPassword;

    return (
      <>
        <ToastContainer position={toast.POSITION.TOP_RIGHT} />
        <div className="container-fluid">
          <div className="main-container">
            <Header />
            <div className="row no-margin signup signup-container">
              <div className="col-md-6 no-padding width">
                <img
                  src={signup}
                  alt="signup"
                  className="img-responsive image"
                />
              </div>
              <div className="col-md-5 sub-container">
                <div className="col-md-12 heading">Sign up</div>
                <Tabs
                  defaultActiveKey="individual"
                  className="col-md-10 offset-1 main-tabs"
                  id="uncontrolled-tab-example"
                  onSelect={key => this.companyFlag(key)}
                >
                  <Tab eventKey="individual" title="Individual">
                    <Individual
                      state={this.state}
                      enable={isEnabled}
                      changeHandler={this.changeHandler}
                      signup={this.signupForm}
                    />
                  </Tab>
                  <Tab
                    eventKey="company"
                    title="Company"
                    style={{ border: "0" }}
                  >
                    <Company
                      state={this.state}
                      enable={isEnabled}
                      changeHandler={this.changeHandler}
                      signup={this.signupForm}
                    />
                  </Tab>
                </Tabs>
                <br />
                <div className="col-md-8 offset-2 googleIcon">
                  <img
                    alt="Google Icon"
                    src={googleIcon}
                    className="img-responsive"
                  />
                  <Link className="link">Sign up with your Google account</Link>
                </div>
                <br />
                <div className="col-md-8 offset-2 googleIcon">
                  <span>Already have DailyPloy account?</span>
                  <Link to={`/login`} className="link">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Signup);
