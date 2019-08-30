import React, { Component } from "react";
import "../../assets/css/dashboard.css";
import { Dropdown } from "react-bootstrap";
import logo from "../../assets/images/logo.png";
import setting from "../../assets/images/setting.png";
import invite from "../../assets/images/invite.png";
import "../../assets/css/dashboard.scss";
import { get } from "../../utils/API";
import userImg from "../../assets/images/profile.png";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workspaces: [],
      userName: "",
    };
  }

  async componentDidMount() {
    try {
      const { data } = await get("user");
      this.setState({ userName: data.name });
    } catch (e) {
      console.log("err", e);
    }
  }

  render() {
    const x = this.state.userName
      .split(" ")
      .map(x => x[0])
      .join("");
    return (
      <>
        <div className="container-fluid dashbaord-header-bg no-padding">
          <div className="dashboard-container dashboard-header-container">
            <nav className="navbar navbar-expand-lg navbar-light">
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarTogglerDemo03"
                aria-controls="navbarTogglerDemo03"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <a
                className="navbar-brand logo"
                href={`/dashboard/${this.props.workspaceId}`}
              >
                <img src={logo} alt="Logo" className="img-responsive image" />
              </a>

              <div
                className="collapse navbar-collapse"
                id="navbarTogglerDemo03"
              >
                <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
                  <Dropdown>
                    <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <i class="fas fa-bell" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown-notification">
                      <div className="col-md-12">
                        <div className="col-md-6 notification-heading">
                          Notifications
                        </div>
                      </div>
                      <Dropdown.Item className="notification-box">
                        <div className="row">
                          <div className="col-md-1 no-padding">
                            <div className="notification-img">
                              <img src={userImg} className="img-responsive" />
                            </div>
                          </div>
                          <div className="col-md-11">
                            <div className="notification-text">
                              Amit Shah added you to the project{" "}
                              <span>
                                Aviabird
                                <br />
                                Technologies
                              </span>
                            </div>
                            <div className="col-md-12 no-padding notification-text text-right">
                              <span>4h </span>
                              Jan 19, 2019
                            </div>
                          </div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item className="notification-box">
                        <div className="row">
                          <div className="col-md-1 no-padding">
                            <div className="notification-img">
                              <img src={userImg} className="img-responsive" />
                            </div>
                          </div>
                          <div className="col-md-11">
                            <div className="notification-text">
                              Amit Shah added you to the project{" "}
                              <span>
                                Aviabird
                                <br />
                                Technologies
                              </span>
                            </div>
                            <div className="col-md-12 no-padding notification-text text-right">
                              <span>4h </span>
                              Jan 19, 2019
                            </div>
                          </div>
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Dropdown>
                    <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <i class="fa fa-bars"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown-position">
                      <Dropdown.Item>
                        <div className="workspace-circle d-inline-block">
                          {"Gaurav Gandhi"
                            .split(" ")
                            .map(x => x[0])
                            .join("")}
                        </div>
                        <div className="workspace-name d-inline-block">
                          Gaurav Gandhi
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="workspace-setting"
                        href={`/workspace/${this.props.workspaceId}/settings`}
                      >
                        <img src={setting} className="img-responsive" />
                        &nbsp;&nbsp;Workspace Settings
                      </Dropdown.Item>
                      <Dropdown.Item className="invite">
                        <img src={invite} className="img-responsive" />
                        &nbsp;&nbsp;Invite to Workspace
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Dropdown>
                    <Dropdown.Toggle
                      className="header-auth-btn"
                      id="dropdown-basic"
                    >
                      {x}
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="header-dropdown">
                      <Dropdown.Item
                        href={`/settings/${this.props.workspaceId}`}
                      >
                        <i className="fa fa-wrench" aria-hidden="true" />
                        <span className="header-dropdown-space" />
                        Settings
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.props.logout}>
                        <i className="fa fa-sign-out" aria-hidden="true" />
                        <span className="header-dropdown-space" />
                        Logout
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <i className="fa fa-desktop" aria-hidden="true" />
                        <span className="header-dropdown-space" />
                        WorkSpaces
                      </Dropdown.Item>
                      {this.props.workspaces.map((workspace, index) => {
                        return (
                          <Dropdown.Item
                            key={index}
                            href={`/dashboard/${workspace.id}`}
                          >
                            <span className="workspace-text">
                              {workspace.name}
                            </span>
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </>
    );
  }
}

export default Header;
