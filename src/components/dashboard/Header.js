import React, { Component } from "react";
import cookie from "react-cookies";
import "../../assets/css/dashboard.css";
import { Dropdown } from "react-bootstrap";
import logo from "../../assets/images/logo.png";
import setting from "../../assets/images/setting.png";
import support from "../../assets/images/support-1.png";
import "../../assets/css/dashboard.scss";
import { get, put } from "../../utils/API";
import { firstTwoLetter } from "../../utils/function";
import userImg from "../../assets/images/profile.png";
import Member from "../../assets/images/member.png";
import Admin from "../../assets/images/admin.png";
import { WORKSPACE_ID, FULL_DATE } from "./../../utils/Constants";
import { getWorkspaceId } from "./../../utils/function";
import SearchFilter from "./../dashboard/SearchFilter";
import moment from "moment";
import { base } from "../../../src/base";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
class Header extends Component {
  constructor(props) {
    super(props);
    this.clickClose = React.createRef();
    this.closeSettingModal = this.closeSettingModal.bind(this);
    this.state = {
      // workspaces: [],
      userName: "",
      userEmail: "",
      userRole: "",
      userId: "",
      searchFlag: "My Reports",
      notifications: [],
      tempSize: 0,
      size: 0,
    };
  }

  async componentDidMount() {
    var loggedInData = cookie.load("loggedInUser");
    if (!loggedInData) {
      try {
        let { data } = await get("logged_in_user");
        this.componentDidMountGetNotifications(data.id);
        this.setState({
          userId: data.id,
          userName: data.name,
          userEmail: data.email,
        });
        localStorage.setItem("logedInId", data.id);
        localStorage.setItem("logedInName", data.name);
      } catch (e) {
        console.log("err", e);
      }
    } else {
      localStorage.setItem("logedInId", loggedInData.id);
      localStorage.setItem("logedInName", loggedInData.name);
      this.componentDidMountGetNotifications(loggedInData.id);
      this.setState({
        userId: loggedInData.id,
        userName: loggedInData.name,
        userEmail: loggedInData.email,
      });
    }
  }

  async componentDidMountGetNotifications(useId) {
    let notificataionData = await get(
      `users/${useId}/notifications?workspace_id=${getWorkspaceId()}`
    );
    this.setState({
      tempSize: notificataionData && notificataionData.data ? notificataionData.data.notifications.length : 0,
      notifications:
        notificataionData && notificataionData.data
          ? notificataionData.data.notifications
          : [],
    });
  }

  async getNotifications(useId) {
    let notificataionData = await get(
      `users/${useId}/notifications?workspace_id=${getWorkspaceId()}`
    );
    console.log(notificataionData.data.notifications);
    // let src = 'https://notificationsounds.com/soundfiles/d7a728a67d909e714c0774e22cb806f2/file-sounds-1150-pristine.wav';
    // let sound = new Audio(src);
    // sound.play();
    this.setState({
      notifications:
        notificataionData && notificataionData.data
          ? notificataionData.data.notifications
          : [],
    });
  }

  UNSAFE_componentWillMount() {
    var workspaceId = getWorkspaceId();

    this.handleNotification(workspaceId);
  }

  handleNotification = async (workspaceId) => {
    base
      .database()
      .ref(`notification/${workspaceId}`)
      .on("child_changed", (snap) => {
        this.getNotificationsUpdate(this.state.userId);
        this.getNotifications(this.state.userId);
      });
  };

  async getNotificationsUpdate(useId) {
    var user = "";
    let notificataionData = await get(
      `users/${useId}/notifications?workspace_id=${getWorkspaceId()}`
    );

    try {
      const { data } = await get(
        `workspaces/${getWorkspaceId()}/members/${this.state.userId}`
      );

      user = data;
    } catch (e) {
      console.log(e);
    }

    if (user.role !== "admin") {
      if (
        notificataionData.data.notifications.length > this.state.tempSize &&
        notificataionData.data.notifications.length !== 0
      ) {
        let src =
          "https://notificationsounds.com/soundfiles/d7a728a67d909e714c0774e22cb806f2/file-sounds-1150-pristine.wav";
        let sound = new Audio(src);
        sound.play();
        this.setState({
          tempSize: notificataionData.data.notifications.length,
        });
      }
      this.createNotification(notificataionData.data.notifications);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      this.props.workspaceId !== prevProps.workspaceId &&
      this.props.workspaceId !== undefined
    ) {
      try {
        const { data } = await get(
          `workspaces/${this.props.workspaceId}/members/${this.state.userId}`
        );
        localStorage.setItem("userRole", data.role);
        this.setState({ userRole: data.role });
      } catch (e) {
        console.log("err", e);
      }
    }
  }

  readAllNotification = async () => {
    if (this.state.notifications) {
      let notification_ids = this.state.notifications.map((data) => {
        return data.id;
      });
      let params = {
        notification_ids: notification_ids,
      };
      try {
        const { data } = await put(
          params,
          `users/${this.state.userId}/notifications/mark_all_as_read`
        );
        this.setState({
          notifications: [],
        });
      } catch (e) {
        console.log("error", e);
      }
    }
  };
  createNotification = (dataNotification) => {
    if (dataNotification) {
      if (dataNotification.length > 0)
        return NotificationManager.info(
          dataNotification[dataNotification.length - 1].data.message,
          dataNotification[dataNotification.length - 1].data.source,
          3000
        );
    }
  };
  closeSettingModal = () => {
    this.clickClose.current.click();
  };

  textTitlize = (text) => {
    return text.replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  };

  isReports = () => {
    let routeName = this.props.pathname;
    if (routeName === "reports") {
      return true;
    }
    return false;
  };

  toggleSearchBy = (text) => {
    this.setState({
      searchFlag: text,
    });
  };

  returnDaysAgo = (date) => {
    return moment.utc(date).fromNow();
  };

  render() {
    const x = firstTwoLetter(this.props.loggedInUserName);
    return (
      <>
        <div className="container-fluid dashbaord-header-bg no-padding">
          <div className="dashboard-container sticky-header dashboard-header-container">
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
                href={`#/workspace/${getWorkspaceId()}/dashboard`}
              >
                <img src={logo} alt="Logo" className="img-responsive image" />
              </a>
              <div className="header-ws-name">
                <span className="bar">|</span>
                {this.props.workspaceName ? (
                  <span
                    className="text-titlize"
                    title={this.textTitlize(this.props.workspaceName)}
                  >
                    {this.props.workspaceName}
                  </span>
                ) : null}
              </div>
              <div className="col-md-7 search-bar-container">
                <SearchFilter
                  searchOptions={this.props.searchOptions}
                  state={this.state}
                  isReports={this.isReports()}
                  toggleSearchBy={this.toggleSearchBy}
                  handleSearchFilterResult={this.props.handleSearchFilterResult}
                />
              </div>
              <div
                className="collapse navbar-collapse"
                id="navbarTogglerDemo03"
              >
                <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="link"
                      id="dropdown-basic"
                      style={{ padding: "8px 20px 0px 0px" }}
                    >
                      <i className="fas fa-bell" style={{ fontSize: "25px" }} />
                    </Dropdown.Toggle>
                    {this.state.notifications &&
                      this.state.notifications.length > 0 && (
                        <div className="notification-icon right">
                          <span className="num-count">
                            {this.state.notifications.length}
                          </span>
                        </div>
                      )}

                    <Dropdown.Menu className="dropdown-notification">
                      <div
                        className="col-md-12"
                        style={{
                          backgroundColor: "rgb(96, 190, 130)",
                          // backgroundColor: "#28b458",
                        }}
                      >
                        <div className="col-md-5 no-padding notification-heading">
                          Notifications
                        </div>
                        {this.state.notifications &&
                          this.state.notifications.length > 0 && (
                            <div className="col-md-7 no-padding notification-heading sett-text">
                              <span onClick={() => this.readAllNotification()}>
                                Mark all as read
                              </span>
                              &nbsp;
                            </div>
                          )}
                      </div>
                      {this.state.notifications &&
                        this.state.notifications.length > 0 ? (
                          <div className="col-md-12 no-padding dropdown-scroll">
                            {this.state.notifications.map((eachNotification) => {
                              return (
                                <Dropdown.Item className="notification-box">
                                  <div className="row" style={{ width: "100%" }}>
                                    {/* <div className="col-md-1 no-padding">
                                      <div className="notification-img">
                                        <img
                                          alt={"userImg"}
                                          src={userImg}
                                          className="img-responsive"
                                        />
                                      </div>
                                    </div> */}

                                    <div className="col-md-12 no-padding notification-text wrap-text">
                                      {eachNotification.data.message}
                                      {/* <span>
                                    Aviabird
                                <br />
                                    Technologies
                              </span> */}
                                    </div>
                                    <div className="col-md-12 no-padding notification-text text-right">
                                      <span>
                                        {this.returnDaysAgo(
                                          eachNotification.inserted_at
                                        )}
                                      </span>
                                      {/* {eachNotification.inserted_at} */}
                                    </div>
                                  </div>
                                </Dropdown.Item>
                              );
                            })}
                          </div>
                        ) : (
                          <Dropdown.Item
                            className="notification-box"
                            style={{ height: "91%" }}
                          >
                            {/* <span>{this.returnDaysAgo("2020-02-03T16:08:44")}</span> */}
                            <div>
                              <i
                                class="fa fa-info-circle"
                                style={{ fontSize: "48px", marginBottom: "8px" }}
                              ></i>
                            </div>
                            <div>There are no notifications for you</div>
                          </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Dropdown ref={this.clickClose}>
                    <Dropdown.Toggle
                      className={`header-auth-btn text-titlize ${this.state.userRole === "admin"
                        ? "admin-circle"
                        : "member-circle"
                        } `}
                      id="dropdown-basic"
                    >
                      {x}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-position ">
                      <div className="display-flex">
                        <div
                          className={`workspace-circle d-inline-block text-titlize ${this.state.userRole === "admin"
                            ? "admin-circle"
                            : "member-circle"
                            } `}
                        >
                          {x}
                        </div>
                        <div className="workspace-name d-inline-block">
                          <span className="text-titlize big">
                            {/* {this.state.userName} */}
                            {this.props.loggedInUserName}
                          </span>
                          <br />
                          <span>{this.state.userEmail}</span>
                          <span
                            className="pull-right close-span"
                            onClick={this.closeSettingModal}
                          >
                            <i className="fa fa-close" aria-hidden="true"></i>
                          </span>
                          <br />
                          <img
                            alt={
                              this.state.userRole === "admin"
                                ? "Admin"
                                : "Member"
                            }
                            src={
                              this.state.userRole === "admin" ? Admin : Member
                            }
                            className="img-responsive"
                          />
                          <span className="text-titlize padding-6px">
                            {this.state.userRole}
                          </span>
                        </div>
                      </div>
                      <Dropdown.Item
                        className="workspace-setting"
                        href={`#/workspace/${getWorkspaceId()}/settings`}
                      >
                        <img
                          alt={"settings"}
                          src={setting}
                          className="img-responsive"
                        />
                        &nbsp;&nbsp;Settings
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="workspace-setting"
                        href="https://dailyploy.com/contact"
                      >
                        <img
                          alt={"support"}
                          src={support}
                          className="img-responsive support-height"
                        />
                        &nbsp;&nbsp;Contact Support
                      </Dropdown.Item>
                      <div className="col-md-12 logout-user">
                        <span className="text-titlize">
                          Not {this.props.loggedInUserName} ?{" "}
                          <button
                            className="btn btn-link"
                            onClick={this.props.logout}
                          >
                            Logout
                          </button>
                        </span>
                      </div>
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
