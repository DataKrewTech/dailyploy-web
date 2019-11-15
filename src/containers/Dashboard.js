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
import { getWeekFisrtDate, getFisrtDate } from "../utils/function";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.format = "h:mm";
    this.now = moment()
      .hour(0)
      .minute(0);
    this.state = {
      taskName: "",
      projectId: "",
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
      userEmail: "",
      isLogedInUserEmailArr: [],
      taskFrequency: "weekly",
      taskStartDate: new Date(),
      calenderTaskModal: false,
      newTask: {},
      user: "",
      modalMemberSearchOptions: [],
    };
  }

  updateTaskDateView = (view, date) => {
    var viewType;
    var type;
    if (view == 0) {
      viewType = "daily";
      type = "day";
    } else if (view == 1) {
      viewType = "weekly";
      type = "week";
    } else if (view == 2) {
      viewType = "monthly";
      type = "month";
    }
    this.setState({
      taskFrequency: viewType,
      taskStartDate: getFisrtDate(date, type),
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      prevState.taskStartDate !== this.state.taskStartDate ||
      prevState.taskFrequency !== this.state.taskFrequency ||
      prevState.newTask !== this.state.newTask
    ) {
      try {
        const { data } = await get(
          `workspaces/${this.state.workspaceId}/user_tasks?frequency=${
          this.state.taskFrequency
          }&start_date=${this.state.taskStartDate}`,
        );
        var tasksUser = data.users.map(user => {
          var usersObj = {
            id: user.id,
            name: user.email === this.state.userEmail ? user.name + " (Me)" : user.name,
          };
          var tasks = user.tasks.map(task => {
            var tasksObj = {
              id: task.id,
              start: task.start_datetime,
              end: task.end_datetime,
              resourceId: user.id,
              title: task.name,
              bgColor: task.project.color_code,
              projectName: task.project.name
            };
            return tasksObj;
          });
          return { usersObj, tasks };
        });
        var tasksResources = tasksUser.sort(user => this.state.userId == user.id).map(user => user.usersObj);
        tasksResources.sort(function (x, y) { return x.id == this.state.userId ? -1 : y.id == this.state.userId ? 1 : 0; });
        var taskEvents = tasksUser.map(user => user.tasks).flat(2);
        this.setState({ resources: tasksResources, events: taskEvents });
      } catch (e) {
      }
    }

  }

  async componentDidMount() {
    // Logged In User Info
    try {
      const { data } = await get("logged_in_user");
      var loggedInData = data;
    } catch (e) {
      console.log("err", e);
    }

    // workspace Listing
    try {
      const { data } = await get("workspaces");
      var workspacesData = data.workspaces;
    } catch (e) {
      console.log("err", e);
    }

    //get workspace Id
    this.getWorkspaceParams();
    this.auth();

    // worksapce project Listing
    try {
      const { data } = await get(
        `workspaces/${this.state.workspaceId}/projects`,
      );
      var projectsData = data.projects;
    } catch (e) {
      console.log("err", e);
    }
    // role api
    try {
      const { data } = await get(`workspaces/${this.state.workspaceId}/members/${loggedInData.id}`);
      var user = data
    } catch (e) {
    }

    // workspace Member Listing
    try {
      const { data } = await get(
        `workspaces/${this.state.workspaceId}/members`,
      );
      var userArr = data.members.map(user => user);
      var emailArr = data.members
        .filter(user => user.email !== loggedInData.email)
    } catch (e) {
      console.log("users Error", e);
    }

    // workspace Tasks Listing
    try {
      const { data } = await get(
        `workspaces/${this.state.workspaceId}/user_tasks?frequency=${
        this.state.taskFrequency
        }&start_date=${getWeekFisrtDate(this.state.taskStartDate)}`,
      );
      var tasksUser = data.users.map(user => {
        var usersObj = {
          id: user.id,
          name: user.email === loggedInData.email ? user.name + " (Me)" : user.name,
        };
        var tasks = user.tasks.map(task => {
          var tasksObj = {
            id: task.id,
            start: moment(task.start_datetime).format("YYYY-MM-DD HH:mm"),
            end: moment(task.end_datetime).format("YYYY-MM-DD HH:mm"),
            resourceId: user.id,
            title: task.name,
            bgColor: task.project.color_code,
            projectName: task.project.name
          };
          return tasksObj;
        });
        return { usersObj, tasks };
      });
      var tasksResources = tasksUser.map(user => user.usersObj)
      tasksResources.sort(function (x, y) { return x.id == loggedInData.id ? -1 : y.id == loggedInData.id ? 1 : 0; });
      var taskEvents = tasksUser.map(user => user.tasks).flat(2);
    } catch (e) {
      console.log("error", e);
    }

    this.setState({
      userId: loggedInData.id,
      userName: loggedInData.name,
      userEmail: loggedInData.email,
      workspaces: workspacesData,
      projects: projectsData,
      users: userArr,
      isLogedInUserEmailArr: emailArr,
      resources: tasksResources,
      events: taskEvents,
      user: user
    });
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
    var startDateTime = moment(this.state.dateFrom).format("YYYY-MM-DD") + " " + this.state.timeFrom
    var endDateTime = moment(this.state.dateTo).format("YYYY-MM-DD") + " " + this.state.timeTo
    const taskData = {
      task: {
        name: this.state.taskName,
        member_ids: this.state.taskUser,
        start_datetime: new Date(startDateTime),
        end_datetime: new Date(endDateTime),
        comments: this.state.comments,
      },
    };
    try {
      const { data } = await post(
        taskData,
        `workspaces/${this.state.workspaceId}/projects/${this.state.projectId}/tasks`,
      );
      var task = data.task
      toast.success("Task Assigned", { autoClose: 2000 });
      this.setState({ show: false });
    } catch (e) {
      this.setState({ show: false });
    }
    this.setState({ newTask: task })
  };

  onSelectSort = value => {
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
    let members = this.memberSearchOptions(this.state.userId)
    this.setState({
      setShow: true,
      show: true,
      modalMemberSearchOptions: members,
    });
  };

  closeTaskModal = () => {
    this.setState({
      show: false,
      taskUser: [],
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
      timeFrom: value != null ? value.format("HH:mm:ss") : null,
    });
  };

  handleTimeTo = value => {
    this.setState({
      timeTo: value != null ? value.format("HH:mm:ss") : null,
    });
  };

  handleUserSelect = e => {
    const { name, value } = e.target;
    let userIdArr = [];
    userIdArr.push(value);
    this.setState({ [name]: userIdArr });
  };

  handleMemberSelect = memberIds => {
    this.setState({ taskUser: memberIds });
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleProjectSelect = projectId => {
    this.setState({ projectId: projectId })
  }

  classNameRoute = () => {
    let route = this.props.history.location.pathname;
    let routeName = route.split("/")[1];
    if (routeName === "dashboard") {
      return "dashboardTrue";
    } else {
      return false;
    }
  };

  memberSearchOptions = (userId) => {
    if (this.state.user.role === 'admin') {
      return this.state.users
    } else {
      return this.state.users.filter(member => member.id === userId)
    }
  }

  setAddTaskDetails = (memberId, startDate, endDate) => {
    let members = this.memberSearchOptions(memberId)
    if (this.state.user.role === 'admin' || this.state.userId == memberId) {
      this.setState({
        taskUser: [memberId],
        show: true,
        calenderTaskModal: true,
        modalMemberSearchOptions: members,
        dateFrom: new Date(startDate), dateTo: new Date(endDate),
      })
    }
  }

  render() {
    return (
      <>
        <ToastContainer position={toast.POSITION.TOP_RIGHT} />
        <div className="row no-margin">
          <Sidebar
            workspaces={this.state.workspaces}
            workspaceId={this.state.workspaceId}
          />
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
              state={this.state}
            />
            <Calendar
              state={this.state}
              sortUnit={this.state.sort}
              workspaceId={this.state.workspaceId}
              resources={this.state.resources}
              events={this.state.events}
              updateTaskDateView={this.updateTaskDateView}
              setAddTaskDetails={this.setAddTaskDetails}
              show={this.state.calenderTaskModal}
              handleMemberSelect={this.handleMemberSelect}
              closeTaskModal={this.closeTaskModal}
              handleProjectSelect={this.handleProjectSelect}
            />
            <div>
              <button
                className="btn menubar-task-btn"
                onClick={this.showTaskModal}>
                <i className="fas fa-plus" />
              </button>
              <AddTaskModal
                show={this.state.show}
                state={this.state}
                closeTaskModal={this.closeTaskModal}
                handleInputChange={this.handleInputChange}
                projects={this.state.projects}
                handleDateFrom={this.handleDateFrom}
                handleDateTo={this.handleDateTo}
                handleTimeFrom={this.handleTimeFrom}
                handleTimeTo={this.handleTimeTo}
                users={this.state.users}
                addTask={this.addTask}
                handleMemberSelect={this.handleMemberSelect}
                handleProjectSelect={this.handleProjectSelect}
                modalMemberSearchOptions={this.state.modalMemberSearchOptions}
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
