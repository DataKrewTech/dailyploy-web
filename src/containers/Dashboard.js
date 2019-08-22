import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { get, post, logout, mockPost } from "../utils/API";
import moment from "moment";
import Header from "../components/dashboard/Header";
import Footer from "../components/Footer";
import "../assets/css/dashboard.scss";
import MenuBar from "../components/dashboard/MenuBar";
import Calendar from "../components/dashboard/Calendar";
import cookie from "react-cookies";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import AddTaskModal from "../components/dashboard/AddTaskModal";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.format = "h:mm a";
    this.now = moment()
      .hour(0)
      .minute(0);
    this.state = {
      taskName: "",
      projectName: "",
      taskUser: "",
      sort: "week",
      show: false,
      setShow: false,
      dateFrom: new Date(),
      dateTo: new Date(),
      timeFrom: "",
      timeTo: "",
      comments: "",
      userId: "",
      userName: "",
      workspaces: [],
      workspaceId: "",
      projects: [],
      users: [],
    };
  }
  async componentDidMount() {
    try {
      const { data } = await get("user");
      this.setState({ userId: data.id, userName: data.name });
    } catch (e) {
      console.log("err", e);
    }

    try {
      const { data } = await get("users");
      const nameArr = data.user.map(user => user.name);
      console.log("usersss", nameArr);
      this.setState({ users: nameArr });
    } catch (e) {
      console.log("users Error", e);
    }

    try {
      const { data } = await get("workspaces");
      console.log("WorkSpace", data.workspaces);
      this.setState({ workspaces: data.workspaces });
    } catch (e) {
      console.log("err", e);
    }
    this.getWorkspaceParams();
    this.auth();

    try {
      const { data } = await get(
        `workspaces/${this.state.workspaceId}/projects`
      );
      console.log("projects list", data.projects);
      this.setState({ projects: data.projects });
    } catch (e) {
      console.log("err", e);
    }
  }

  getWorkspaceParams = () => {
    const { workspaceId } = this.props.match.params;
    this.setState({ workspaceId: workspaceId });
  };

  auth = () => {
    const token = cookie.load("authToken");
    if (token !== "undefined") {
      return this.props.history.push(`/dashboard/${this.state.workspaceId}`);
    } else {
      return this.props.history.push("/login");
    }
  };

  addTask = async () => {
    const taskData = {
      task: {
        name: this.state.taskName,
        project_name: this.state.projectName,
        user: this.state.taskUser,
        date_from: this.state.dateFrom,
        date_to: this.state.dateTo,
        time_from: this.state.timeFrom,
        time_to: this.state.timeTo,
        comments: this.state.comments,
      },
    };
    try {
      const { data } = await mockPost(taskData, "task");
      toast.success("Task Assigned");
      console.log("Task Data", data);
      this.setState({ show: false });
    } catch (e) {
      console.log("error", e.response);
      this.setState({ show: false });
    }
  };

  onSelectSort = value => {
    console.log("selected value ", value);
    this.setState({ sort: value });
  };

  logout = async () => {
    await logout();
    this.props.history.push("/login");
  };

  showTaskModal = () => {
    this.setState({
      setShow: true,
      show: true,
    });
  };

  closeTaskModal = () => {
    this.setState({
      show: false,
    });
  };

  handleDateFrom = date => {
    this.setState({ dateFrom: date });
  };
  handleDateTo = date => {
    this.setState({ dateTo: date });
  };

  handleTimeFrom = value => {
    this.setState({
      timeFrom: value,
    });
  };

  handleTimeTo = value => {
    this.setState({
      timeTo: value,
    });
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    return (
      <>
        <ToastContainer position={toast.POSITION.TOP_RIGHT} />
        <Header logout={this.logout} workspaces={this.state.workspaces} />
        <MenuBar
          onSelectSort={this.onSelectSort}
          workspaceId={this.state.workspaceId}
        />
        <Calendar sortUnit={this.state.sort} />
        <div>
          <button className="btn menubar-task-btn" onClick={this.showTaskModal}>
            <i class="fas fa-plus" />
          </button>
          <AddTaskModal
            state={this.state}
            closeTaskModal={this.closeTaskModal}
            handleInputChange={this.handleInputChange}
            project={this.state.projects}
            handleDateFrom={this.handleDateFrom}
            handleDateTo={this.handleDateTo}
            handleTimeFrom={this.handleTimeFrom}
            handleTimeTo={this.handleTimeTo}
            user={this.state.users}
            addTask={this.addTask}
          />
        </div>

        {/* <Footer />  */}
      </>
    );
  }
}

export default withRouter(Dashboard);
