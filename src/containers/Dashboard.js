import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { get, post, logout } from "../utils/API";
import moment from "moment";
import Header from "../components/dashboard/Header";
import "../assets/css/dashboard.scss";
import MenuBar from "../components/dashboard/MenuBar";
import Calendar from "../components/dashboard/Calendar";
import cookie from "react-cookies";
import { ToastContainer, toast } from "react-toastify";
import AddTaskModal from "../components/dashboard/AddTaskModal";
import Sidebar from "../components/dashboard/Sidebar";

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
      taskUser: [],
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
      resources: [],
      events: [],
      isLoading: false,
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
      const userArr = data.user.map(user => user);
      this.setState({ users: userArr });
    } catch (e) {
      console.log("users Error", e);
    }

    try {
      const { data } = await get("workspaces");
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
      this.setState({ projects: data.projects });
    } catch (e) {
      console.log("err", e);
    }

    try {
      const { data } = await get(
        `workspaces/${this.state.workspaceId}/project_tasks`
      );
      let tasksResources = data.tasks
        .map(task => task.user)
        .reduce((prev, current) => {
          if (prev.length === 0) {
            prev.push(current);
          } else {
            if (prev.every(el => el.id !== current.id)) {
              prev.push(current);
            }
          }
          return prev;
        }, []);
      let taskEvents = data.tasks.map(task => {
        var obj = {
          id: task.id,
          start: task.start_datetime,
          end: task.end_datetime,
          resourceId: task.user.id,
          title: task.name,
          bgColor: "#D9D9D9",
        };
        return obj;
      });
      this.setState({ resources: tasksResources, events: taskEvents });
    } catch (e) {
      console.log("error", e);
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
        member_ids: this.state.taskUser,
        start_datetime:
          moment(this.state.dateFrom).format("YYYY-MM-DD") +
          " " +
          this.state.timeFrom,
        end_datetime:
          moment(this.state.dateTo).format("YYYY-MM-DD") +
          " " +
          this.state.timeTo,
        comments: this.state.comments,
      },
    };
    try {
      const { data } = await post(
        taskData,
        `workspaces/${this.state.workspaceId}/projects/${this.state.projectName}/tasks`
      );
      toast.success("Task Assigned", { autoClose: 2000 });
      setTimeout(() => window.location.reload(), 3000);

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

  handleLoad = value => {
    this.setState({ isLoading: value });
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
      timeFrom: value.format("HH:mm:ss"),
    });
  };

  handleTimeTo = value => {
    this.setState({
      timeTo: value.format("HH:mm:ss"),
    });
  };

  handleUserSelect = e => {
    const { name, value } = e.target;
    let userIdArr = [];
    userIdArr.push(value);
    this.setState({ [name]: userIdArr });
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  classNameRoute = () => {
    let route = this.props.history.location.pathname;
    let routeName = route.split("/")[1];
    if (routeName === "dashboard") {
      return "dashboardTrue";
    } else {
      return false;
    }
  };

  render() {
    return (
      <>
        <ToastContainer position={toast.POSITION.TOP_RIGHT} />
        <div className="row no-margin">
          <Sidebar workspaces={this.state.workspaces} />
          <div className="dashboard-main no-padding">
            <Header
              logout={this.logout}
              workspaces={this.state.workspaces}
              workspaceId={this.state.workspaceId}
            />
            <MenuBar
              onSelectSort={this.onSelectSort}
              workspaceId={this.state.workspaceId}
              classNameRoute={this.classNameRoute}
              handleLoad={this.handleLoad}
            />
            <Calendar
              sortUnit={this.state.sort}
              workspaceId={this.state.workspaceId}
              resources={this.state.resources}
              events={this.state.events}
              alam={"alam"}
            />
            <div>
              <button
                className="btn menubar-task-btn"
                onClick={this.showTaskModal}
              >
                <i className="fas fa-plus" />
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
                handleUserSelect={this.handleUserSelect}
              />
            </div>
          </div>
        </div>
        {/* <Footer />  */}
      </>
    );
  }
}

export default withRouter(Dashboard);
