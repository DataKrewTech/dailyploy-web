import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { get, post, put, logout, del } from "../utils/API";
import moment from "moment";
import "../assets/css/dashboard.scss";
import MenuBar from "../components/dashboard/MenuBar";
import Calendar from "../components/dashboard/Calendar";
import cookie from "react-cookies";
import { toast } from "react-toastify";
import AddTaskModal from "../components/dashboard/AddTaskModal";
import {
  getWeekFisrtDate,
  getFisrtDate,
  convertUTCToLocalDate,
  getMiddleDates
} from "../utils/function";
import DailyPloyToast from "../components/DailyPloyToast";
import {
  PRIORITIES,
  DEFAULT_PRIORITIE,
  DATE_FORMAT1,
  HRMIN,
  FULL_DATE,
  DATE_FORMAT5
} from "../utils/Constants";
import TaskInfoModal from "./../components/dashboard/TaskInfoModal";
import TaskConfirm from "./../components/dashboard/TaskConfirm";
import { base } from "./../../src/base";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.format = "h:mm";
    this.now = moment()
      .hour(0)
      .minute(0);
    this.viewType = {
      weekly: "week",
      daily: "day",
      monthly: "month"
    };
    this.state = {
      loadFireBase: false,
      taskName: "",
      projectId: "",
      taskUser: [],
      sort: "week",
      show: false,
      setShow: false,
      dateFrom: new Date(),
      dateTo: new Date(),
      timeFrom: "",
      timeTo: null,
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
      taskStartDate: moment().format("YYYY-MM-DD"),
      calenderTaskModal: false,
      newTask: {},
      project: null,
      taskId: "",
      taskEvent: "",
      selectedMembers: [],
      user: "",
      modalMemberSearchOptions: [],
      taskButton: "Add",
      border: "solid 1px #ffffff",
      isBorder: false,
      editProjectId: "",
      timeDateTo: null,
      timeDateFrom: null,
      worksapceUsers: [],
      selectedTaskMember: [],
      memberProjects: [],
      showInfo: false,
      fromInfoEdit: false,
      taskConfirmModal: false,
      backFromTaskEvent: true,
      confirmModalText: "",
      icon: "play",
      startOn: "",
      status: false,
      taskCategories: [],
      timeTracked: [],
      taskCategorie: "",
      showAlert: false,
      newAddedProject: null,
      errors: {
        taskNameError: "",
        projectError: "",
        memberError: "",
        dateFromError: "",
        dateToError: "",
        timeFromError: "",
        timeToError: "",
        categoryError: ""
      },
      taskPrioritie: {
        name: "no_priority",
        color_code: "#9B9B9B",
        label: "no priority"
      },
      showEventAlertId: "",
      trackingEvent: null,
      taskloader: false,
      task: [],
      validateTimefrom: null,
      taskComments: null,
      isPlayPause: false
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
      taskStartDate: getFisrtDate(date, type)
    });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (
      (prevState.taskStartDate !== this.state.taskStartDate ||
        prevState.taskFrequency !== this.state.taskFrequency ||
        prevState.newTask !== this.state.newTask ||
        prevProps.searchProjectIds !== this.props.searchProjectIds ||
        prevProps.searchUserDetails !== this.props.searchUserDetails) &&
      this.state.workspaceId != ""
    ) {
      try {
        this.props.handleLoading(true);
        var userIds =
          this.props.searchUserDetails.length > 0
            ? this.props.searchUserDetails.map(member => member.member_id)
            : [];
        var searchData = {
          frequency: this.state.taskFrequency,
          start_date: getFisrtDate(this.state.taskStartDate),
          user_id: userIds.join(","),
          project_ids: this.props.searchProjectIds.join(",")
        };
        const { data } = await get(
          `workspaces/${this.state.workspaceId}/user_tasks`,
          searchData
        );
        var sortedUsers = data.users.sort((x, y) => {
          return x.id === this.state.userId
            ? -1
            : y.id === this.state.userId
            ? 1
            : 0;
        });
        var taskRunningObj = {
          status: false,
          startOn: null,
          taskId: ""
        };
        var trackingEvent = this.state.trackingEvent;
        let generatedObj = this.generateTaskObject(
          sortedUsers,
          {
            id: this.state.userId,
            name: this.state.userName,
            email: this.state.userEmail
          },
          taskRunningObj,
          trackingEvent
        );
        taskRunningObj = generatedObj.taskRunningObj;
        trackingEvent = generatedObj.trackingEvent;
        var tasksUser = generatedObj.tasksUser;
        var tasksResources = tasksUser.map(user => user.usersObj);
        var taskEvents = tasksUser
          .map(user => user.tasks)
          .flat(2)
          .sort((a, b) => Number(a.sortedTime) - Number(b.sortedTime));
        this.setState({
          resources: tasksResources ? tasksResources : [],
          events: taskEvents ? taskEvents : [],
          status: taskRunningObj.status
            ? taskRunningObj.status
            : this.state.status,
          taskId: taskRunningObj.taskId,
          startOn: taskRunningObj.startOn,
          trackingEvent: trackingEvent
        });
        let projects = [];
        this.state.projects.forEach(project => {
          let flag = true;
          userIds.map(id => {
            if (!project.members.map(m => m.id).includes(id)) {
              flag = false;
            }
          });
          if (flag) {
            projects.push(project);
          }
        });
        this.createUserProjectList(
          projects.filter(
            project => !this.props.searchProjectIds.includes(project.id)
          ),
          this.state.worksapceUsers.filter(
            member => !userIds.includes(member.id)
          )
        );
        this.props.handleLoading(false);
      } catch (e) {
        this.props.handleLoading(false);
      }
    }

    if (prevState.timeFrom !== this.state.timeFrom) {
      var startDateTime = null;
      if (this.state.timeFrom) {
        startDateTime =
          moment().format("YYYY-MM-DD") + " " + this.state.timeFrom;
        startDateTime = moment(startDateTime);
      }
      this.setState({ timeDateFrom: startDateTime });
    }

    if (prevState.timeTo !== this.state.timeTo) {
      var endDateTime = null;
      if (this.state.timeTo !== null) {
        endDateTime = moment().format("YYYY-MM-DD") + " " + this.state.timeTo;
        endDateTime = moment(endDateTime);
      }
      this.setState({ timeDateTo: endDateTime });
    }

    if (prevState.status != this.state.status && this.state.status) {
      let event = this.state.events.find(e => e.id == this.state.taskId);
      this.props.handleTaskBottomPopup(
        this.state.startOn,
        this.state.trackingEvent,
        "start"
      );
    }
    if (prevState.status != this.state.status && !this.state.status) {
      this.props.handleTaskBottomPopup("", null, "stop");
    }

    if (
      prevProps.state.event != this.props.state.event &&
      this.props.state.event == null &&
      this.state.status
    ) {
      var events = this.state.events;
      if (
        prevProps.state.event &&
        prevProps.state.event.id == this.state.taskId
      ) {
        let id = this.state.taskId.split("-")[0];
        var filterEvents = events.filter(e => e.taskId == id);
        filterEvents.forEach(event => {
          event["trackingStatus"] = "play";
          event["startOn"] = "";
        });
        this.setState({
          status: false,
          startOn: "",
          taskId: "",
          events: events
        });
      }
    }
  }

  async componentDidMount() {
    // Logged In User Info
    this.handleLoad(true);
    var loggedInData = cookie.load("loggedInUser");
    if (!loggedInData) {
      try {
        const { data } = await get("logged_in_user");
        var loggedInData = data;
      } catch (e) {
        console.log("err", e);
      }
    }

    // workspace Listing
    try {
      const { data } = await get("workspaces");
      var workspacesData = data.workspaces;
    } catch (e) {
      console.log("err", e);
    }

    //get workspace Id
    var workspaceId = this.props.match.params.workspaceId;

    // worksapce project Listing
    try {
      const { data } = await get(`workspaces/${workspaceId}/projects`);
      var projectsData = data.projects;
    } catch (e) {
      console.log("err", e);
    }
    // role api
    try {
      const { data } = await get(
        `workspaces/${workspaceId}/members/${loggedInData.id}`
      );
      var user = data;
    } catch (e) {}

    // workspace Member Listing
    try {
      const { data } = await get(`workspaces/${workspaceId}/members`);
      var worksapceUsers = data.members;
      var userArr = data.members.map(user => user);
      var emailArr = data.members.filter(
        user => user.email !== loggedInData.email
      );
    } catch (e) {
      console.log("users Error", e);
    }

    // Category Listing
    try {
      const { data } = await get(`workspaces/${workspaceId}/task_category`);
      var taskCategories = data.task_categories;
    } catch (e) {}

    // workspace Tasks Listing
    try {
      var userIds =
        this.props.searchUserDetails.length > 0
          ? this.props.searchUserDetails.map(member => member.member_id)
          : [];
      var searchData = {
        frequency: this.state.taskFrequency,
        start_date: getWeekFisrtDate(this.state.taskStartDate),
        user_id: userIds.join(","),
        project_ids: this.props.searchProjectIds.join(",")
      };
      var taskRunningObj = {
        status: false,
        startOn: null,
        taskId: ""
      };
      var trackingEvent = null;
      const { data } = await get(
        `workspaces/${workspaceId}/user_tasks`,
        searchData
      );
      var userId = loggedInData.id;
      var sortedUsers = data.users.sort((x, y) => {
        return x.id === userId ? -1 : y.id === userId ? 1 : 0;
      });
      let generatedObj = this.generateTaskObject(
        sortedUsers,
        loggedInData,
        taskRunningObj,
        trackingEvent
      );
      taskRunningObj = generatedObj.taskRunningObj;
      trackingEvent = generatedObj.trackingEvent;
      var tasksUser = generatedObj.tasksUser;
      var tasksResources = tasksUser.map(user => user.usersObj);
      var taskEvents = tasksUser
        .map(user => user.tasks)
        .flat(2)
        .sort((a, b) => Number(a.sortedTime) - Number(b.sortedTime));
    } catch (e) {
      console.log("error", e);
    }

    // if (!taskRunningObj.status && trackingEvent == null) {
    //   try {
    //     const { data } = await get(`workspaces/${workspaceId}/running_task`);
    //     var task = data.task;
    //     trackingEvent = this.createTaskObject(
    //       task,
    //       { id: loggedInData.id },
    //       moment(task.start_datetime).format(DATE_FORMAT1)
    //     );
    //     taskRunningObj["status"] = true;
    //     taskRunningObj["taskId"] = task.id;
    //   } catch (e) {
    //     console.log("users Error", e);
    //   }
    // }

    this.setState({
      userId: loggedInData.id,
      userName: loggedInData.name,
      userEmail: loggedInData.email,
      workspaces: workspacesData,
      projects: projectsData,
      users: userArr,
      isLogedInUserEmailArr: emailArr,
      resources: tasksResources ? tasksResources : [],
      events: taskEvents ? taskEvents : [],
      user: user,
      selectedMembers: [loggedInData],
      worksapceUsers: worksapceUsers,
      taskCategories: taskCategories,
      workspaceId: workspaceId,
      status: taskRunningObj.status ? taskRunningObj.status : this.state.status,
      taskId: taskRunningObj.taskId,
      startOn: taskRunningObj.startOn,
      trackingEvent: trackingEvent,
      loadFireBase: true
    });
    this.createUserProjectList(this.state.projects, this.state.worksapceUsers);
    this.handleLoad(false);
  }

  generateTaskObject = (
    sortedUsers,
    userData,
    taskRunningObj,
    trackingEvent
  ) => {
    var trackingEvent = trackingEvent;
    var tasksUser = sortedUsers.map(user => {
      var usersObj = {
        id: user.id,
        name: user.email === userData.email ? user.name + " (Me)" : user.name
      };
      var tasks = user.date_formatted_tasks.map((dateWiseTasks, index) => {
        var task = dateWiseTasks.tasks.map(task => {
          var tasksObj = this.createTaskObject(task, user, dateWiseTasks.date);
          if (user.id == userData.id && task.time_tracked.length > 0) {
            let runningTask = task.time_tracked
              .flat()
              .find(ttt => ttt.status == "running");
            if (runningTask) {
              let taskStartOn = new Date(runningTask.start_time).getTime();
              // let taskStartOn = convertUTCToLocalDate(
              //   runningTask.start_time
              // ).getTime();
              taskRunningObj = {
                status: true,
                startOn: taskStartOn,
                taskId: tasksObj.id
              };
              tasksObj["trackingStatus"] = "pause";
              tasksObj["startOn"] = taskStartOn;
              trackingEvent = tasksObj;
            }
          } else {
            let runningTask = task.time_tracked
              .flat()
              .find(ttt => ttt.status == "running");
            if (runningTask) {
              let taskStartOn = new Date(runningTask.start_time).getTime();
              // let taskStartOn = convertUTCToLocalDate(
              //   runningTask.start_time
              // ).getTime();
              tasksObj["trackingStatus"] = "pause";
              tasksObj["startOn"] = taskStartOn;
            }
          }
          return tasksObj;
        });
        return task;
      });
      return { usersObj, tasks };
    });
    return {
      taskRunningObj: taskRunningObj,
      trackingEvent: trackingEvent,
      tasksUser: tasksUser
    };
  };

  createTaskObject = (task, user, dateWiseTasksDate) => {
    let startDateTime =
      moment(dateWiseTasksDate).format(DATE_FORMAT1) +
      " " +
      moment(new Date(task.start_datetime)).format("HH:mm");
    let endDateTime =
      moment(dateWiseTasksDate).format(DATE_FORMAT1) +
      " " +
      moment(new Date(task.end_datetime)).format("HH:mm");
    let sortedTime =
      moment(convertUTCToLocalDate(task.start_datetime)).format("HH:mm") !=
      "00:00"
        ? moment(convertUTCToLocalDate(task.start_datetime)).format("HH.mm")
        : moment(task.created_at).format("HH.mm");
    let newTaskId = task.id + "-" + dateWiseTasksDate;
    let dateFormattedTimeTracks = task.date_formatted_time_tracks
      ? task.date_formatted_time_tracks.find(
          dateLog => dateLog.date == dateWiseTasksDate
        )
      : null;
    return {
      date: dateWiseTasksDate,
      id: newTaskId,
      taskId: task.id,
      created_at: task.created_at,
      sortedTime: sortedTime,
      start: moment(startDateTime).format("YYYY-MM-DD HH:mm"),
      end: moment(endDateTime).format("YYYY-MM-DD HH:mm"),
      taskStartDate: moment(task.start_datetime).format(DATE_FORMAT1),
      taskEndDate: moment(task.end_datetime).format(DATE_FORMAT1),
      taskStartDateTime: moment(task.start_datetime).format(FULL_DATE),
      taskEndDateTime: moment(task.end_datetime).format(FULL_DATE),
      resourceId: user.id,
      title: task.name,
      bgColor: task.project.color_code,
      projectName: task.project.name,
      comments: task.comments,
      projectId: task.project.id,
      timeTracked: dateFormattedTimeTracks
        ? dateFormattedTimeTracks.time_tracks
        : [],
      allTimeTracked: task.time_tracked,
      dateFormattedTimeTrack: task.date_formatted_time_tracks,
      priority: task.priority,
      status: task.status,
      trackingStatus: task.status == "completed" ? "completed" : "play",
      startOn: null
    };
  };

  createUserProjectList = (projects, users) => {
    let projectList = [];
    let memberList = [];

    if (projects) {
      projects.map((project, index) => {
        projectList.push({
          value: project.name,
          project_id: project.id,
          type: "project"
        });
      });
    }

    if (users) {
      users.map((member, idx) => {
        memberList.push({
          value: member.name,
          member_id: member.id,
          email: member.email,
          type: "member",
          role: member.role
        });
      });
    }
    var searchOptions = {
      members: memberList,
      projects: projectList
    };
    this.props.setSearchOptions(searchOptions);
  };

  getWorkspaceParams = () => {
    const { workspaceId } = this.props.match.params;
    this.setState({ workspaceId: workspaceId });
  };

  auth = () => {
    const token = cookie.load("authToken");
    if (token !== "undefined") {
      return this.props.history.push(
        `/workspace/${this.state.workspaceId}/dashboard`
      );
    } else {
      return this.props.history.push("/login");
    }
  };

  addTask = async () => {
    if (this.validateTaskModal()) {
      this.setState({ taskloader: true });
      const taskData = this.taskDetails();
      try {
        const { data } = await post(
          taskData,
          `workspaces/${this.state.workspaceId}/projects/${this.state.projectId}/tasks`
        );
        var task = data.task;
        toast(
          <DailyPloyToast
            message="Task Created successfully!"
            status="success"
          />,
          { autoClose: 2000, position: toast.POSITION.TOP_CENTER }
        );
        let dates = getMiddleDates(task.start_datetime, task.end_datetime);
        let taskObjects = dates.map(date => {
          return this.createTaskSyncObject(date, task, this.state.project);
        });
        var events = [this.state.events, ...taskObjects]
          .flat()
          .sort((a, b) => Number(a.sortedTime) - Number(b.sortedTime));
        this.setState({
          events: events,
          border: "solid 1px #ffffff",
          taskName: "",
          project: null,
          taskCategorie: ""
        });

        let start = moment(convertUTCToLocalDate(task.start_datetime));
        let end = moment(convertUTCToLocalDate(task.end_datetime));
        let today = moment().format(DATE_FORMAT1);
        let startDate = start.format(DATE_FORMAT1);
        let startTime = start.format("HH.mm");
        let endTime = end.format("HH.mm");
        if (
          task.members[0].id == this.state.userId &&
          ((startDate == today &&
            startTime == "00.00" &&
            endTime == "00.00" &&
            this.state.validateTimefrom == null) ||
            (startDate == today &&
              startTime == "00.00" &&
              this.state.validateTimefrom != null &&
              this.state.validateTimefrom <= moment().format("HH.mm")))
        ) {
          this.handleTaskStart(taskObjects[0], Date.now());
        }
        this.closeTaskModal();
      } catch (e) {
        this.setState({
          show: false,
          taskloader: false,
          border: "solid 1px #ffffff"
        });
      }
    }
  };

  updateTask = async (taskData, taskId, projectId) => {
    try {
      const { data } = await put(
        taskData,
        `workspaces/${this.state.workspaceId}/projects/${projectId}/tasks/${taskId}`
      );
      var task = data.task;
      toast(
        <DailyPloyToast
          message="Task Updated successfully!"
          status="success"
        />,
        { autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      );
      this.setState({
        show: false,
        newTask: task,
        taskConfirmModal: false,
        backFromTaskEvent: true,
        border: "solid 1px #ffffff"
      });
    } catch (e) {
      this.setState({ show: false, border: "solid 1px #ffffff" });
    }
  };

  editTask = async () => {
    if (this.validateTaskModal()) {
      const taskData = this.taskDetails();
      var taskId = this.state.taskId.split("-")[0];
      this.updateTask(taskData, taskId, this.state.editProjectId);
    }
  };

  taskDetails = () => {
    var startDateTime =
      moment(this.state.dateFrom).format(DATE_FORMAT1) +
      (this.state.timeFrom && this.state.timeTo
        ? " " + this.state.timeFrom
        : " 00:00:00");
    var endDateTime =
      moment(this.state.dateTo ? this.state.dateTo : new Date()).format(
        DATE_FORMAT1
      ) +
      (this.state.timeTo && this.state.timeFrom
        ? " " + this.state.timeTo
        : " 00:00:00");

    var taskData = {
      task: {
        name: this.state.taskName,
        member_ids: this.state.taskUser,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        comments: this.state.comments,
        project_id: this.state.project.id,
        category_id: this.state.taskCategorie.task_category_id,
        priority:
          this.state.taskPrioritie && this.state.taskPrioritie.name
            ? this.state.taskPrioritie.name
            : "no_priority"
      }
    };
    return taskData;
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
    let members = this.memberSearchOptions(this.state.userId);
    if (this.state.user.role === "admin") {
      this.setState({
        setShow: true,
        show: true,
        taskUser: [],
        selectedMembers: [],
        modalMemberSearchOptions: this.state.newAddedProject
          ? this.state.newAddedProject.members
          : this.state.project
          ? this.state.project.members
          : members,
        project: this.state.newAddedProject
          ? this.state.newAddedProject
          : this.state.project,
        memberProjects: this.state.project
          ? this.state.memberProjects
          : this.state.projects,
        errors: {
          taskNameError: "",
          projectError: "",
          memberError: "",
          dateFromError: "",
          dateToError: "",
          timeFromError: "",
          timeToError: "",
          categoryError: ""
        }
      });
    } else {
      var memberProjects = this.state.projects.filter(project =>
        project.members.map(member => member.id).includes(this.state.userId)
      );
      let selected = {
        email: this.state.userEmail,
        id: this.state.userId,
        name: this.state.userName
      };
      this.setState({
        setShow: true,
        show: true,
        taskUser: [this.state.userId],
        modalMemberSearchOptions: [selected],
        project: this.state.newAddedProject
          ? this.state.newAddedProject
          : this.state.project,
        memberProjects: memberProjects,
        selectedMembers: [selected],
        errors: {
          taskNameError: "",
          projectError: "",
          memberError: "",
          dateFromError: "",
          dateToError: "",
          timeFromError: "",
          timeToError: "",
          categoryError: ""
        }
      });
    }
  };

  closeOnlyTaskModal = () => {
    if (this.state.taskButton != "Add") {
      this.closeTaskModal();
    } else {
      this.setState({
        show: false
      });
    }
  };

  closeTaskModal = () => {
    this.setState({
      show: false,
      showInfo: false,
      taskConfirmModal: false,
      backFromTaskEvent: true,
      taskUser: [],
      taskButton: "Add",
      modalMemberSearchOptions: [],
      memberProjects: [],
      dateFrom: new Date(),
      dateTo: new Date(),
      timeFrom: null,
      timeTo: null,
      timeDateTo: null,
      taskId: "",
      selectedMembers: [],
      taskName: "",
      projectId: "",
      project: null,
      comments: "",
      border: "solid 1px #ffffff",
      taskEvent: "",
      fromInfoEdit: false,
      timeTracked: [],
      showAlert: false,
      logTimeTo: null,
      logTimeFrom: null,
      taskPrioritie: DEFAULT_PRIORITIE,
      taskCategorie: null,
      errors: {
        taskNameError: "",
        projectError: "",
        memberError: "",
        dateFromError: "",
        dateToError: "",
        timeFromError: "",
        timeToError: "",
        categoryError: ""
      },
      taskloader: false
    });
  };

  handleDateFrom = date => {
    var errors = this.state.errors;
    errors["dateFromError"] = "";
    if (date > new Date()) {
      errors["dateToError"] = "";
      this.setState({
        dateFrom: date,
        dateTo: null,
        errors: errors
      });
    } else {
      this.setState({ dateFrom: date, errors: errors });
    }
  };

  handleDateTo = date => {
    var errors = this.state.errors;
    errors["dateToError"] = "";
    this.setState({ dateTo: date, errors: errors });
  };

  handleTimeFrom = value => {
    var errors = this.state.errors;
    errors["timeFromError"] = "";
    this.setState({
      timeFrom: value != null ? value.format("HH:mm:ss") : null,
      errors: errors,
      timeTo:
        value != null && value.format("HH:mm:ss") > this.state.timeTo
          ? null
          : this.state.timeTo,
      validateTimefrom: value != null ? value.format("HH.mm") : null
    });
  };

  handleTimeTo = value => {
    var errors = this.state.errors;
    errors["timeToError"] = "";
    this.setState({
      timeTo: value != null ? value.format("HH:mm:ss") : null,
      errors: errors
    });
  };

  timeTrackUpdate = (log, flag) => {
    if (log) {
      let date = moment(log.start_date).format(DATE_FORMAT1);
      var taskEvent = this.state.taskEvent;
      var dateFormattedTimeTrack = taskEvent.dateFormattedTimeTrack;
      var dateFilterLog = dateFormattedTimeTrack.find(
        dateLog => dateLog.date == date
      );
      var allTimeTracks = taskEvent.allTimeTracked.filter(
        tt => tt.id != log.id
      );
      allTimeTracks.push(log);
      taskEvent["allTimeTracked"] = allTimeTracks;
      if (dateFilterLog && dateFilterLog.time_tracks) {
        var newLog = [];
        if (flag == "delete") {
          newLog = dateFilterLog.time_tracks.filter(dLog => dLog.id != log.id);
        } else {
          dateFilterLog.time_tracks.forEach(dLog => {
            if (dLog.id == log.id) {
              newLog.push(log);
            } else {
              newLog.push(dLog);
            }
          });
        }
        dateFilterLog["time_tracks"] = newLog;

        this.setState({
          taskEvent: taskEvent
        });
        this.loadUserTask(this.state.workspaceId);
      }
    }
  };

  handleUserSelect = e => {
    const { name, value } = e.target;
    let userIdArr = [];
    userIdArr.push(value);
    this.setState({ [name]: userIdArr });
  };

  handleMemberSelect = member => {
    var errors = this.state.errors;
    errors["memberError"] = "";
    if (member) {
      this.setState({
        taskUser: [member.id],
        selectedMembers: [member],
        errors: errors
      });
    } else {
      this.setState({
        taskUser: [],
        selectedMembers: [],
        errors: errors
      });
    }
  };

  // saveComments = async (comments, attachments) => {
  //   this.setState({ isLoading: true });
  //   try {
  //     let fd = new FormData();
  //     attachments.forEach(image => {
  //       fd.append("attachments[]", image, image.name);
  //     });
  //     fd.append("user_id", this.state.userId);
  //     fd.append("task_id", this.state.taskEvent.taskId);
  //     fd.append("comments", comments);
  //     const { data } = await post(fd, `comment`);
  //     var comment = data;
  //     comment["user"] = {
  //       id: this.state.userId,
  //       name: this.state.userName,
  //       email: this.state.userEmail
  //     };
  //     var taskComments = [comment, ...this.state.taskComments];
  //     this.setState({ taskComments: taskComments, isLoading: false });
  //   } catch (e) {
  //     this.setState({ isLoading: false });
  //   }
  // };

  updateTaskComments = comments => {
    this.setState({ taskComments: comments });
  };

  // updateComments = async (commnetId, comments, attachments) => {
  //   try {
  //     this.setState({ isLoading: true });
  //     let fd = new FormData();
  //     attachments.forEach(image => {
  //       fd.append("attachments[]", image, image.name);
  //     });
  //     fd.append("user_id", this.state.userId);
  //     fd.append("task_id", this.state.taskEvent.taskId);
  //     fd.append("comments", comments);
  //     const { data } = await put(fd, `comment/${commnetId}`);
  //     var comment = data;
  //     var taskComments = this.state.taskComments.filter(c => c.id != commnetId);
  //     var taskComments = [...taskComments, comment];
  //     this.setState({ taskComments: taskComments, isLoading: false });
  //   } catch (e) {
  //     this.setState({ isLoading: false });
  //   }
  // };

  deleteComments = async comment => {
    try {
      const { data } = await del(`comment/${comment.id}`);
      var taskComments = this.state.taskComments.filter(c => c.id !== data.id);
      this.setState({ taskComments: taskComments });
    } catch (e) {}
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    var errors = this.state.errors;
    errors[`${name}Error`] = "";
    this.setState({ [name]: value, errors: errors });
  };

  handleProjectSelect = option => {
    let options = [];
    var memberIds = [];
    if (option) {
      if (this.state.user.role === "admin") {
        options = option.members;
        // options.push({
        //   email: this.state.userEmail,
        //   id: this.state.userId,
        //   name: this.state.userName
        // });
      } else {
        options = option.members.filter(
          member => member.id === this.state.userId
        );
      }
      options = Array.from(new Set(options.map(JSON.stringify))).map(
        JSON.parse
      );
      memberIds = options.map(member => member.id);
      memberIds = Array.from(new Set(memberIds));
      var removedMembers = this.state.selectedMembers.filter(selecteMember =>
        memberIds.includes(selecteMember.id)
      );
      var taskUsers = removedMembers.map(m => m.id);
      var errors = this.state.errors;
      errors["projectError"] = "";
      this.setState({
        projectId: option.id,
        selectedMembers: removedMembers,
        project: option,
        taskUser: taskUsers,
        modalMemberSearchOptions: options,
        border: "solid 1px #9b9b9b",
        isBorder: false,
        errors: errors
      });
    } else {
      this.setState({
        projectId: null,
        selectedMembers: [],
        project: option,
        taskUser: [],
        modalMemberSearchOptions: []
      });
    }
  };

  classNameRoute = () => {
    let route = this.props.history.location.pathname;
    let routeName = route.split("/")[3];
    if (routeName === "dashboard") {
      return "dashboardTrue";
    } else {
      return false;
    }
  };

  memberSearchOptions = (userId, projectId) => {
    var projects = this.state.projects.filter(project =>
      project.id === projectId
        ? projectId
        : this.state.newAddedProject
        ? this.state.newAddedProject.id
        : null
    );
    var members = projects.length > 0 ? projects[0].members : [];
    if (this.state.user.role === "member") {
      members = members.filter(member => member.id === userId);
    }
    return members;
  };

  setAddTaskDetails = (memberId, startDate, endDate) => {
    var startDate = new Date(startDate.replace(/-/g, "/"));
    var endDate = new Date(endDate.replace(/-/g, "/"));
    let members = this.memberSearchOptions(memberId);
    var selectedMembers = this.state.users.filter(
      member => memberId === member.id
    );

    var memberProjects = this.state.projects.filter(project =>
      project.members.map(member => member.id).includes(memberId)
    );
    var selecteMember = selectedMembers.map(member => {
      return { email: member.email, id: member.id, name: member.name };
    });
    let newSelected = this.state.newAddedProject
      ? this.state.newAddedProject.members.map(m => m.id).includes(memberId)
        ? selecteMember
        : []
      : selecteMember;
    if (this.state.user.role === "admin" || this.state.userId == memberId) {
      this.setState({
        taskUser: newSelected.length > 0 ? [memberId] : [],
        selectedMembers: newSelected,
        show: true,
        // taskName: "",
        project: this.state.newAddedProject
          ? this.state.newAddedProject
          : this.state.project &&
            this.state.taskUser &&
            this.state.taskUser[0] == memberId
          ? this.state.project
          : null,
        projectId: this.state.newAddedProject
          ? this.state.newAddedProject.id
          : this.state.project &&
            this.state.taskUser &&
            this.state.taskUser[0] == memberId
          ? this.state.project.id
          : null,
        taskId: "",
        modalMemberSearchOptions: this.addTaskMembers(members, selecteMember),
        dateFrom: new Date(startDate),
        dateTo: new Date(endDate),
        border: "solid 1px #ffffff",
        // timeDateTo: moment(),
        timeDateFrom: this.isCurrentDateTask(startDate) ? moment() : null,
        // timeTo: moment().format("HH:mm"),
        timeFrom: this.isCurrentDateTask(startDate)
          ? moment().format("HH:mm")
          : null,
        validateTimefrom: this.isCurrentDateTask(startDate)
          ? moment().format("HH.mm")
          : null,
        memberProjects: memberProjects,
        errors: {
          taskNameError: "",
          projectError: "",
          memberError: "",
          dateFromError: "",
          dateToError: "",
          timeFromError: "",
          timeToError: "",
          categoryError: ""
        }
      });
    }
  };

  isCurrentDateTask = startDate => {
    return (
      moment().format(DATE_FORMAT1) == moment(startDate).format(DATE_FORMAT1)
    );
  };

  addTaskMembers = (members, selecteMember) => {
    if (this.state.newAddedProject) {
      return this.state.newAddedProject.members;
    } else if (
      this.state.project &&
      this.state.taskUser &&
      this.state.taskUser[0] == selecteMember[0].id
    ) {
      return this.state.project.members;
    } else if (members.length > 0) {
      return members;
    }
    return selecteMember;
  };

  validateTaskModal = () => {
    var errors = {};
    var flag = true;
    errors["taskNameError"] = this.state.taskName
      ? ""
      : "please enter task name";
    errors["projectError"] =
      this.state.projectId && this.state.project ? "" : "please select project";
    errors["memberError"] =
      this.state.taskUser.length > 0 ? "" : "please select members";
    errors["dateFromError"] = this.state.dateFrom
      ? ""
      : "please select date from";
    errors["categoryError"] = this.state.taskCategorie
      ? ""
      : "please select category";
    if (this.state.dateTo == null && this.state.dateFrom != null) {
      if (
        moment(this.state.dateFrom).format(DATE_FORMAT1) ===
        moment().format(DATE_FORMAT1)
      ) {
        errors["dateToError"] = "";
      } else {
        errors["dateToError"] = "please select date to";
        flag = false;
      }
    }
    if (!this.state.timeTo && !this.state.timeFrom) {
      errors["timeFromError"] = "";
      errors["timeToError"] = "";
    } else if (
      this.state.timeFrom &&
      !this.state.timeTo &&
      moment(this.state.dateFrom).format(DATE_FORMAT1) !==
        moment().format(DATE_FORMAT1)
    ) {
      errors["timeToError"] = "please select time to";
    } else if (
      this.state.timeFrom &&
      !this.state.timeTo &&
      moment(this.state.dateFrom).format(DATE_FORMAT1) ===
        moment().format(DATE_FORMAT1)
    ) {
      errors["timeToError"] = "";
    } else if (
      (this.state.timeFrom != "" || this.state.timeFrom !== null) &&
      (this.state.timeTo == "" || this.state.timeTo == null)
    ) {
      errors["timeToError"] = "please select time to";
    } else if (
      (this.state.timeFrom == "" || this.state.timeFrom == null) &&
      (this.state.timeTo != "" || this.state.timeTo != null)
    ) {
      errors["timeFromError"] = "please select time from";
    } else {
      errors["timeFromError"] = "";
      errors["timeToError"] = "";
    }
    this.setState({ errors: errors });
    return (
      this.state.taskName &&
      this.state.projectId &&
      this.state.project &&
      this.state.taskUser.length > 0 &&
      this.validateTime() &&
      this.state.dateFrom &&
      this.state.taskCategorie &&
      flag
    );
  };

  validateTime = () => {
    if (this.state.timeFrom == null && this.state.timeTo == null) {
      return true;
    } else if (this.state.timeFrom != null && this.state.timeTo != null) {
      return true;
    } else if (
      this.state.timeFrom != null &&
      this.state.timeTo == null &&
      moment(this.state.dateFrom).format(DATE_FORMAT1) ===
        moment().format(DATE_FORMAT1)
    ) {
      return true;
    } else if (this.state.timeFrom == null && this.state.timeTo != null) {
      return false;
    } else {
      return false;
    }
  };

  convertUTCDateToLocalDate = date => {
    var newDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000
    );
    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();
    return newDate;
  };

  editAddTaskDetails = async (taskId, event) => {
    let members = this.memberSearchOptions(event.resourceId, event.projectId);
    var memberProjects = this.state.projects.filter(project =>
      project.members.map(member => member.id).includes(event.resourceId)
    );
    var project = this.state.projects.filter(
      project => project.id === event.projectId
    );
    var eventTasks = this.state.events.filter(
      taskEvent => taskEvent.id === event.id
    );
    var memberIds = eventTasks.map(filterEvent => filterEvent.resourceId);
    var selectedMembers = this.state.users.filter(member =>
      memberIds.includes(member.id)
    );
    var taskComments = null;
    try {
      const { data } = await get(`tasks/${taskId}`);
      // var startDate = convertUTCToLocalDate(data.start_datetime);
      // var endDate = convertUTCToLocalDate(data.end_datetime);
      var startDate = new Date(
        convertUTCToLocalDate(
          moment(data.start_datetime)
            .format(`${DATE_FORMAT1} HH:mm:ss`)
            .replace(/-/g, "/")
        )
      );
      var endDate = new Date(
        convertUTCToLocalDate(
          moment(data.end_datetime)
            .format(`${DATE_FORMAT1} HH:mm:ss`)
            .replace(/-/g, "/")
        )
      );
      taskComments = data.task_comments;
      var startTime = moment(startDate).format("HH:mm:ss");
      var endTime = moment(endDate).format("HH:mm:ss");
      var taskCategorie = data.category;
      var timeTracked = data.time_tracked;
      event["dateFormattedTimeTrack"] = data.date_formatted_time_tracks;
      event["allTimeTracked"] = data.time_tracked;
      var taskPrioritie = PRIORITIES.find(opt => opt.name === data.priority);
    } catch (e) {}
    if (
      this.state.user.role === "admin" ||
      this.state.userId == event.resourceId
    ) {
      this.setState({
        taskButton: "Save",
        taskUser: memberIds,
        calenderTaskModal: true,
        modalMemberSearchOptions: members,
        dateFrom: startDate,
        dateTo: endDate,
        timeFrom: startTime != "00:00:00" ? startTime : null,
        timeTo: endTime != "00:00:00" ? endTime : null,
        taskId: event.id,
        selectedMembers: selectedMembers,
        taskName: event.title,
        editProjectId: event.projectId,
        projectId: event.projectId,
        project: project[0],
        comments: event.comments,
        taskCategorie: taskCategorie,
        showInfo: true,
        selectedTaskMember: selectedMembers,
        memberProjects: memberProjects,
        taskEvent: event,
        timeTracked: timeTracked,
        taskPrioritie: taskPrioritie,
        taskComments: taskComments
      });
    }
  };

  taskInfoEdit = () => {
    this.setState({
      showInfo: false,
      show: true,
      fromInfoEdit: true
    });
  };

  confirmModal = modal => {
    if (modal != "") {
      this.setState({
        confirmModalText: modal,
        showInfo: false,
        taskConfirmModal: true,
        show: false
      });
    }
  };

  backToTaskInfoModal = () => {
    this.setState({
      showInfo: true,
      taskConfirmModal: false,
      show: false,
      backFromTaskEvent: true
    });
  };

  taskMarkComplete = async event => {
    if (event) {
      let start = moment(convertUTCToLocalDate(event.start)).format("HH:mm");
      let end = moment(convertUTCToLocalDate(event.end)).format("HH:mm");
      if (
        event.timeTracked.length > 0 ||
        (this.state.logTimeFrom && this.state.logTimeTo) ||
        (start != "00:00" && end != "00:00")
      ) {
        let searchData = {
          task: {
            status: "completed"
          }
        };
        if (this.state.logTimeFrom && this.state.logTimeTo) {
          var startDateTime =
            moment(event.taskStartDate).format(DATE_FORMAT1) +
            " " +
            moment(this.state.logTimeFrom).format(HRMIN);
          var endDateTime =
            moment(event.taskEndDate).format(DATE_FORMAT1) +
            " " +
            moment(this.state.logTimeTo).format(HRMIN);
          searchData.task["start_datetime"] = startDateTime;
          searchData.task["end_datetime"] = endDateTime;
        }
        if (
          this.state.status &&
          this.state.trackingEvent &&
          this.state.trackingEvent.taskId == event.taskId
        ) {
          this.handleTaskStop(event, Date.now());
        }
        let taskId = event.id.split("-")[0];
        try {
          this.setState({ taskloader: true });
          const { data } = await put(
            searchData,
            `workspaces/${this.state.workspaceId}/projects/${event.projectId}/make_as_complete/${taskId}`
          );
          var events = this.state.events;
          var filterEvents = events.filter(e => e.taskId != event.taskId);
          var updateEvents = events.filter(e => e.taskId == event.taskId);
          updateEvents.forEach(event => {
            event["timeTracked"] = data.task.time_tracked;
            event["status"] = "completed";
            event["trackingStatus"] = "completed";
          });
          var newEvents = [...filterEvents, ...updateEvents].flat();
          this.setState({
            events: newEvents,
            taskEvent: event,
            taskConfirmModal: false,
            backFromTaskEvent: true,
            showInfo: true,
            taskloader: false
          });
        } catch (e) {}
      } else {
        this.setState({
          logTimeFromError: this.state.logTimeFrom
            ? ""
            : "please select time from",
          logTimeToError: this.state.logTimeTo ? "" : "please select time to",
          taskloader: false
        });
      }
    }
  };

  updateTaskEvent = async (event, taskData) => {
    let taskId = event.id.split("-")[0];
    try {
      this.setState({ taskloader: true });
      const { data } = await put(
        taskData,
        `workspaces/${this.state.workspaceId}/projects/${event.projectId}/tasks/${taskId}`
      );
      var events = this.state.events;
      var event = events.find(e => e.id == event.id);
      event["timeTracked"] = data.task.time_tracked;
      event["status"] = data.task.status;
      event["trackingStatus"] = data.task.status == "completed" ? "" : "play";
      this.setState({
        events: events,
        taskEvent: event,
        taskConfirmModal: false,
        backFromTaskEvent: true,
        showInfo: true,
        taskloader: false
      });
    } catch (e) {
      this.setState({ taskloader: false });
    }
  };

  validCrossMove = (resourceId, event) => {
    let project = this.state.projects.find(p => p.id === event.projectId);
    return project && project.members.map(m => m.id).includes(resourceId);
  };

  taskDelete = async event => {
    if (event) {
      let taskId = event.id.split("-")[0];
      this.setState({ taskloader: true });
      try {
        const { data } = await del(
          `workspaces/${this.state.workspaceId}/projects/${event.projectId}/tasks/${taskId}`
        );
        var events = this.state.events.filter(e => e.taskId != event.taskId);
        this.setState({
          events: events,
          taskEvent: "",
          taskConfirmModal: false,
          backFromTaskEvent: false,
          showInfo: false,
          taskloader: false
        });
        if (
          this.state.status &&
          this.state.trackingEvent.taskId == event.taskId
        ) {
          this.setState({
            status: false,
            trackingEvent: null
          });
        }
        this.closeTaskModal();
      } catch (e) {
        if (
          e.response.status == 403 &&
          e.response.data &&
          !e.response.data.task_owner
        ) {
          toast(
            <DailyPloyToast
              message={"You can't delete this task, only task owner can."}
              status="error"
            />,
            {
              autoClose: 2000,
              position: toast.POSITION.TOP_CENTER
            }
          );
          let self = this;
          setTimeout(function() {
            self.setState({ taskloader: false });
          }, 2000);
        }
      }
    }
  };

  taskResume = event => {
    if (event) {
      let searchData = {
        status: "running"
      };
      this.updateTaskEvent(event, searchData);
    }
  };

  handleTaskPlay = () => {
    this.setState({ icon: "check" });
  };

  // handleTaskStartTop = async taskEvent => {
  //   var status = this.state.status;
  //   var showAlert = false;
  //   var events = this.state.events;
  //   var alertEventId = "";
  //   if (status) {
  //     if (
  //       this.state.trackingEvent &&
  //       this.state.trackingEvent.taskId == taskEvent.taskId
  //     ) {
  //       this.props.handleTaskBottomPopup("", null, "stop");
  //       this.handleTaskTracking("stop", taskEvent, Date.now());
  //       status = !this.state.status;
  //       var event = events.find(event => event.id === taskEvent.id);
  //       event["trackingStatus"] = "play";
  //       event["startOn"] = null;
  //     } else {
  //       showAlert = true;
  //       alertEventId = taskEvent.id;
  //     }
  //   } else {
  //     var startOn = Date.now();
  //     this.props.handleTaskBottomPopup(startOn, taskEvent, "start");
  //     this.handleTaskTracking("start", taskEvent, startOn);
  //     status = !this.state.status;
  //     // var event = events.find(event => event.id === taskEvent.id);
  //     // event["trackingStatus"] = "pause";
  //     // event["startOn"] = startOn;
  //     var filterEvents = events.filter(
  //       event => event.taskId === taskEvent.taskId
  //     );
  //     filterEvents.forEach(event => {
  //       event["trackingStatus"] = "pause";
  //       event["startOn"] = startOn;
  //     });
  //   }
  //   this.setState({
  //     status: status,
  //     showPopup: false,
  //     startOn: startOn,
  //     showAlert: showAlert,
  //     events: events,
  //     trackingEvent: taskEvent,
  //     showEventAlertId: alertEventId
  //   });
  // };

  taskEventResumeConfirm = (event, modalText) => {
    this.setState({
      dateFrom: new Date(event.start),
      dateTo: new Date(event.end),
      taskId: event.id,
      taskName: event.title,
      projectId: event.projectId,
      project: { name: event.projectName, color_code: event.bgColor },
      comments: event.comments,
      taskConfirmModal: true,
      backFromTaskEvent: false,
      taskEvent: event,
      confirmModalText: modalText
    });
  };

  handleCategoryChange = option => {
    var errors = this.state.errors;
    errors["categoryError"] = "";
    this.setState({ taskCategorie: option, errors: errors });
  };

  handlePrioritiesChange = option => {
    this.setState({ taskPrioritie: option });
  };

  handleTaskTracking = async (taskType, eventTask, dateTime) => {
    if (taskType && eventTask && dateTime) {
      var taskId = eventTask.id.split("-")[0];
      if (taskType === "start") {
        // let d = moment(eventTask.start).format(DATE_FORMAT1);
        // let t = moment(dateTime).format(HHMMSS);
        // let newDateTime = moment(d + " " + t);
        var taskDate = {
          start_time: new Date(dateTime),
          status: "running"
        };
        try {
          const { data } = await post(
            taskDate,
            `tasks/${taskId}/start-tracking`
          );
          var events = this.state.events;
          var filterEvents = events.filter(event => event.taskId === taskId);
          filterEvents.forEach(event => {
            event["trackingStatus"] = "pause";
            event["startOn"] = dateTime;
          });
          var event = filterEvents.find(dd => dd.id == eventTask.id);
          this.setState({
            status: true,
            startOn: dateTime,
            taskId: eventTask.id,
            trackingEvent: event,
            events: events
          });
        } catch (e) {}
      } else if (taskType === "stop") {
        // let d = moment(eventTask.start).format(DATE_FORMAT1);
        // let t = moment(dateTime).format(HHMMSS);
        // let newDateTime = moment(d + " " + t);
        var taskDate = {
          end_time: new Date(dateTime),
          status: "stopped"
        };
        try {
          const { data } = await put(taskDate, `tasks/${taskId}/stop-tracking`);
          var events = this.state.events;
          var filterEvents = events.filter(
            event => event.taskId === eventTask.taskId
          );
          filterEvents.forEach(event => {
            var timeTracked = [...event.timeTracked, ...[data]];
            event["timeTracked"] = timeTracked;
            event["startOn"] = null;
            event["trackingStatus"] = "play";
          });
          var infoTimeTrackLog = [...this.state.timeTracked, ...[data]];
          this.setState({
            events: events,
            timeTracked: infoTimeTrackLog,
            trackingEvent: null
          });
        } catch (e) {}
      }
    }
  };

  handleTaskStart = async (eventTask, dateTime) => {
    this.setState({ isPlayPause: true });
    if (this.state.status && this.state.trackingEvent) {
      this.handleTaskStop(this.state.trackingEvent, Date.now());
    }
    this.handleTaskStartOnly(eventTask, dateTime);
  };

  handleTaskStartOnly = async (eventTask, dateTime) => {
    if (eventTask && dateTime) {
      var taskId = eventTask.id.split("-")[0];
      var taskDate = {
        start_time: new Date(dateTime),
        status: "running"
      };
      try {
        const { data } = await post(taskDate, `tasks/${taskId}/start-tracking`);
        var events = this.state.events;
        // if (this.state.status && this.state.trackingEvent) {
        //   var prevFilterEvents = events.filter(
        //     event => event.taskId == this.state.trackingEvent.taskId
        //   );
        //   prevFilterEvents.forEach(event => {
        //     event["trackingStatus"] = "play";
        //     event["startOn"] = null;
        //     event["status"] = "running";
        //   });
        // }
        var filterEvents = events.filter(event => event.taskId == taskId);
        filterEvents.forEach(event => {
          event["trackingStatus"] = "pause";
          event["startOn"] = dateTime;
          event["status"] = "running";
        });
        var event = filterEvents.find(dd => dd.id == eventTask.id);
        this.setState({
          status: true,
          startOn: dateTime,
          taskId: eventTask.id,
          trackingEvent: event,
          events: events,
          isPlayPause: false
        });
      } catch (e) {}
    }
  };

  handleTaskStop = async (eventTask, dateTime) => {
    if (eventTask && dateTime) {
      var taskId = eventTask.id.split("-")[0];
      var taskDate = {
        end_time: new Date(dateTime),
        status: "stopped"
      };
      try {
        const { data } = await put(taskDate, `tasks/${taskId}/stop-tracking`);
        var events = this.state.events;
        var filterEvents = events.filter(
          event => event.taskId == eventTask.taskId
        );
        filterEvents.forEach(event => {
          var timeTracked = [...event.timeTracked, ...[data]];
          event["timeTracked"] = timeTracked;
          event["startOn"] = null;
          event["status"] = "running";
          event["trackingStatus"] = "play";
        });
        var infoTimeTrackLog = [...this.state.timeTracked, ...[data]];
        this.setState({
          status: false,
          events: events,
          timeTracked: infoTimeTrackLog,
          trackingEvent: null
        });
      } catch (e) {}
    }
  };

  handleLogTimeFrom = value => {
    this.setState({
      logTimeFrom: value,
      logTimeFromError: ""
    });
  };

  handleLogTimeTo = value => {
    this.setState({
      logTimeTo: value,
      logTimeToError: ""
    });
  };

  updateTaskEvent = async (event, data) => {
    let taskId = event.id.split("-")[0];
    this.updateTask({ task: data }, taskId, event.projectId);
  };

  addCategory = async categoryName => {
    if (categoryName != "") {
      try {
        const { data } = await post(
          { name: categoryName },
          `workspaces/${this.state.workspaceId}/task_category`
        );
        var taskCategory = data;
        toast(<DailyPloyToast message="Category Added" status="success" />, {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER
        });
        var newTaskCategories = [...this.state.taskCategories, taskCategory];
        this.setState({
          taskCategories: newTaskCategories,
          taskCategorie: taskCategory
        });
      } catch (e) {
        if (e.response && e.response.status === 400) {
          if (
            e.response.data &&
            e.response.data.errors &&
            e.response.data.errors.workspace_task_category_uniqueness
          ) {
            toast(
              <DailyPloyToast
                message={
                  e.response.data.errors.workspace_task_category_uniqueness
                }
                status="error"
              />,
              {
                autoClose: 2000,
                position: toast.POSITION.TOP_CENTER
              }
            );
          }
        }
      }
    }
  };

  updateTaskEventLogTime = taskLog => {
    var taskEvent = this.state.taskEvent;
    var taskLogs = taskEvent.timeTracked.filter(l => l.id != taskLog.id);
    let newlogs = [...taskLogs, taskLog];
    taskEvent["timeTracked"] = newlogs;
    this.setState({ taskEvent: taskEvent });
  };

  manageProjectListing = project => {
    project["owner"] = { name: `${this.state.userName}` };
    var filterdProjects = [...this.state.projects, ...[project]];
    this.setState({
      projects: filterdProjects,
      // modalMemberSearchOptions: [],
      newAddedProject: project
    });
  };

  componentWillMount() {
    var workspaceId = this.props.match.params.workspaceId;
    this.handleTaskCreate(workspaceId);
    this.handleTaskDelete(workspaceId);
    this.handleTaskTracking(workspaceId);
    // this.handleTaskRunning(workspaceId);
    // this.handleTaskSyncStop(workspaceId);
    this.handleTaskUpdate(workspaceId);
  }

  handleTaskCreate = async workspaceId => {
    base
      .database()
      .ref(`task_created/${workspaceId}`)
      .on("child_added", snap => {
        if (
          this.state.loadFireBase &&
          !this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          let task = snap.val();
          let dates = getMiddleDates(task.start_datetime, task.end_datetime);
          let taskObjects = dates.map(date => {
            return this.createTaskSyncObject(date, task);
          });
          var events = [this.state.events, ...taskObjects].flat();
          var events = events.sort(
            (a, b) => Number(a.sortedTime) - Number(b.sortedTime)
          );
          this.setState({ events: events });
        }
      });
  };

  handleTaskDelete = async workspaceId => {
    base
      .database()
      .ref(`task_deleted/${workspaceId}`)
      .on("child_added", snap => {
        if (
          this.state.loadFireBase &&
          this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          let task = snap.val();
          let events = this.state.events.filter(
            event => event.taskId != task.id
          );
          this.setState({ events: events });
        }
      });
  };

  // handleTaskRunning = async workspaceId => {
  //   base
  //     .database()
  //     .ref(`task_running/${workspaceId}`)
  //     .on("child_added", snap => {
  //       let task = snap.val();
  //       if (
  //         this.state.loadFireBase &&
  //         !this.state.events.map(task => task.taskId).includes(snap.val().id)
  //       ) {
  //         this.loadUserTask(workspaceId);
  //       }
  //     });

  //   base
  //     .database()
  //     .ref(`task_running/${workspaceId}`)
  //     .on("child_changed", snap => {
  //       this.loadUserTask(workspaceId);
  //     });
  // };

  handleTaskTracking = async workspaceId => {
    base
      .database()
      .ref(`task_status/${workspaceId}`)
      .on("child_added", snap => {
        let task = snap.val();
        if (
          this.state.loadFireBase &&
          !this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          this.loadUserTask(workspaceId);
        }
      });

    base
      .database()
      .ref(`task_status/${workspaceId}`)
      .on("child_changed", snap => {
        this.loadUserTask(workspaceId);
      });
  };

  // handleTaskSyncStop = async workspaceId => {
  //   base
  //     .database()
  //     .ref(`task_stopped/${workspaceId}`)
  //     .on("child_added", snap => {
  //       if (
  //         this.state.loadFireBase &&
  //         !this.state.events.map(task => task.taskId).includes(snap.val().id)
  //       ) {
  //         this.loadUserTask(workspaceId);
  //       }
  //     });

  //   base
  //     .database()
  //     .ref(`task_stopped/${workspaceId}`)
  //     .on("child_changed", snap => {
  //       this.loadUserTask(workspaceId);
  //     });
  // };

  loadUserTask = async workspaceId => {
    if (this.state.workspaceId) {
      try {
        var userIds =
          this.props.searchUserDetails.length > 0
            ? this.props.searchUserDetails.map(member => member.member_id)
            : [];
        var searchData = {
          frequency: this.state.taskFrequency,
          start_date: getFisrtDate(this.state.taskStartDate),
          user_id: userIds.join(","),
          project_ids: this.props.searchProjectIds.join(",")
        };
        const { data } = await get(
          `workspaces/${workspaceId}/user_tasks`,
          searchData
        );
        var sortedUsers = data.users.sort((x, y) => {
          return x.id === this.state.userId
            ? -1
            : y.id === this.state.userId
            ? 1
            : 0;
        });
        var taskRunningObj = {
          status: false,
          startOn: null,
          taskId: ""
        };
        var trackingEvent = this.state.trackingEvent;
        let generatedObj = this.generateTaskObject(
          sortedUsers,
          {
            id: this.state.userId,
            name: this.state.userName,
            email: this.state.userEmail
          },
          taskRunningObj,
          trackingEvent
        );
        taskRunningObj = generatedObj.taskRunningObj;
        trackingEvent = generatedObj.trackingEvent;
        var tasksUser = generatedObj.tasksUser;
        var tasksResources = tasksUser.map(user => user.usersObj);
        var taskEvents = tasksUser
          .map(user => user.tasks)
          .flat(2)
          .sort((a, b) => Number(a.sortedTime) - Number(b.sortedTime));

        this.setState({
          resources: tasksResources ? tasksResources : [],
          events: taskEvents ? taskEvents : [],
          status: taskRunningObj.status,
          taskId: taskRunningObj.taskId,
          startOn: taskRunningObj.startOn,
          trackingEvent: trackingEvent
        });
      } catch (e) {}
    }
  };

  createTaskSyncObject = (date, task, project) => {
    let startDateTime =
      moment(date).format(DATE_FORMAT1) +
      " " +
      moment(new Date(task.start_datetime)).format("HH:mm");
    let endDateTime =
      moment(date).format(DATE_FORMAT1) +
      " " +
      moment(new Date(task.end_datetime)).format("HH:mm");
    let newTaskId = task.id + "-" + date;
    let sortedTime =
      moment(convertUTCToLocalDate(task.start_datetime)).format("HH:mm") !=
      "00:00"
        ? moment(convertUTCToLocalDate(task.start_datetime)).format("HH.mm")
        : moment(task.inserted_at).format("HH.mm");
    return {
      date: date,
      id: newTaskId,
      taskId: task.id,
      start: startDateTime,
      end: endDateTime,
      sortedTime: sortedTime,
      created_at: task.created_at,
      taskStartDate: moment(task.start_datetime).format(DATE_FORMAT1),
      taskEndDate: moment(task.end_datetime).format(DATE_FORMAT1),
      taskStartDateTime: moment(task.start_datetime).format(FULL_DATE),
      taskEndDateTime: moment(task.end_datetime).format(FULL_DATE),
      resourceId: task.members.length > 0 ? task.members[0].id : null,
      title: task.name,
      bgColor: project ? project.color_code : task.project.color_code,
      projectName: project ? project.name : task.project.name,
      comments: task.comments ? task.comments : "",
      projectId: project ? project.id : task.project.id,
      timeTracked: [],
      allTimeTracked: [],
      priority: task.priority,
      status: task.status,
      trackingStatus: "play",
      startOn: null
    };
  };

  updateTaskSyncObject = (date, task) => {
    let startDateTime =
      moment(date).format(DATE_FORMAT1) +
      " " +
      moment(new Date(task.start_datetime)).format("HH:mm");
    let endDateTime =
      moment(date).format(DATE_FORMAT1) +
      " " +
      moment(new Date(task.end_datetime)).format("HH:mm");
    let sortedTime =
      moment(convertUTCToLocalDate(task.start_datetime)).format("HH:mm") !=
      "00:00"
        ? moment(convertUTCToLocalDate(task.start_datetime)).format("HH.mm")
        : moment(task.inserted_at).format("HH.mm");
    let newTaskId = task.id + "-" + date;
    let event = this.state.events.find(e => e.id == newTaskId);
    return {
      date: date,
      id: newTaskId,
      taskId: task.id,
      start: startDateTime,
      end: endDateTime,
      sortedTime: sortedTime,
      taskStartDate: moment(task.start_datetime).format(DATE_FORMAT1),
      taskEndDate: moment(task.end_datetime).format(DATE_FORMAT1),
      taskStartDateTime: moment(task.start_datetime).format(FULL_DATE),
      taskEndDateTime: moment(task.end_datetime).format(FULL_DATE),
      resourceId: task.members.length > 0 ? task.members[0].id : null,
      title: task.name,
      bgColor: task.project.color_code,
      projectName: task.project.name,
      comments: task.comments ? task.comments : "",
      projectId: task.project.id,
      timeTracked: event ? event.timeTracked : [],
      allTimeTracked: event ? event.allTimeTracked : [],
      dateFormattedTimeTrack: event ? event.dateFormattedTimeTrack : [],
      priority: task.priority,
      status: task.status,
      trackingStatus: task.status == "completed" ? "check" : "play",
      startOn: null
    };
  };

  handleTaskUpdate = async workspaceId => {
    base
      .database()
      .ref(`task_update/${workspaceId}`)
      .on("child_added", snap => {
        if (
          this.state.loadFireBase &&
          this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          let task = snap.val();
          let dates = getMiddleDates(task.start_datetime, task.end_datetime);
          let events = this.state.events.filter(
            event => event.taskId != task.id
          );
          let taskObjects = dates.map(date => {
            return this.updateTaskSyncObject(date, task);
          });
          var finalEvents = [events, ...taskObjects]
            .flat()
            .sort((a, b) => Number(a.sortedTime) - Number(b.sortedTime));
          this.setState({ events: finalEvents });
        }
      });

    base
      .database()
      .ref(`task_update/${workspaceId}`)
      .on("child_changed", snap => {
        if (
          this.state.loadFireBase &&
          this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          let task = snap.val();
          let dates = getMiddleDates(task.start_datetime, task.end_datetime);
          let events = this.state.events.filter(
            event => event.taskId != task.id
          );
          let taskObjects = dates.map(date => {
            return this.updateTaskSyncObject(date, task);
          });
          var finalEvents = [events, ...taskObjects]
            .flat()
            .sort((a, b) => Number(a.sortedTime) - Number(b.sortedTime));
          this.setState({ events: finalEvents });
        }
      });

    base
      .database()
      .ref(`task_completed/${workspaceId}`)
      .on("child_added", snap => {
        if (
          this.state.loadFireBase &&
          this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          let task = snap.val();
          var events = this.state.events;
          var filterEvents = events.filter(event => event.taskId == task.id);
          filterEvents.forEach(event => {
            event["trackingStatus"] =
              task.status == "completed" ? "check" : "play";
            event["status"] = task.status;
          });
          var events = events.sort(
            (a, b) => Number(a.sortedTime) - Number(b.sortedTime)
          );
          this.setState({ events: events });
        }
      });

    base
      .database()
      .ref(`task_completed/${workspaceId}`)
      .on("child_changed", snap => {
        if (
          this.state.loadFireBase &&
          this.state.events.map(task => task.taskId).includes(snap.val().id)
        ) {
          let task = snap.val();
          var events = this.state.events;
          var filterEvents = events.filter(event => event.taskId == task.id);
          filterEvents.forEach(event => {
            event["trackingStatus"] =
              task.status == "completed" ? "check" : "play";
            event["status"] = task.status;
          });
          var events = events.sort(
            (a, b) => Number(a.sortedTime) - Number(b.sortedTime)
          );
          this.setState({ events: events });
        }
      });
  };

  handleTaskNameChange = async (name, value) => {
    this.setState({ [name]: value });
  };

  componentWillUnmount() {}

  render() {
    return (
      <>
        {this.state.isLoading ? <div className="loading"></div> : null}
        <div
          className="row no-margin"
          style={this.state.isLoading ? { pointerEvents: "none" } : {}}
        >
          <MenuBar
            onSelectSort={this.onSelectSort}
            workspaceId={this.state.workspaceId}
            classNameRoute={this.classNameRoute}
            handleLoad={this.handleLoad}
            state={this.state}
            manageProjectListing={this.manageProjectListing}
          />
          <div className="padding-top-60px">
            <Calendar
              state={this.state}
              sortUnit={this.state.sort}
              workspaceId={this.state.workspaceId}
              resources={this.state.resources}
              events={this.state.events}
              updateTaskDateView={this.updateTaskDateView}
              setAddTaskDetails={this.setAddTaskDetails}
              editAddTaskDetails={this.editAddTaskDetails}
              show={this.state.calenderTaskModal}
              closeTaskModal={this.closeTaskModal}
              handleProjectSelect={this.handleProjectSelect}
              handleTaskBottomPopup={this.props.handleTaskBottomPopup}
              onGoingTask={this.props.state.isStart}
              taskEventResumeConfirm={this.taskEventResumeConfirm}
              handleTaskTracking={this.handleTaskTracking}
              updateTaskEvent={this.updateTaskEvent}
              handleTaskStartTop={this.handleTaskStartTop}
              handleTaskStart={this.handleTaskStart}
              handleTaskStop={this.handleTaskStop}
              handleLoading={this.props.handleLoading}
              validCrossMove={this.validCrossMove}
            />
          </div>

          <div>
            <button
              className="btn menubar-task-btn"
              onClick={this.showTaskModal}
            >
              <i className="fas fa-plus" />
            </button>
            <AddTaskModal
              show={this.state.show}
              state={this.state}
              closeTaskModal={this.closeOnlyTaskModal}
              handleInputChange={this.handleInputChange}
              projects={this.state.memberProjects}
              handleDateFrom={this.handleDateFrom}
              handleDateTo={this.handleDateTo}
              handleTimeFrom={this.handleTimeFrom}
              handleTimeTo={this.handleTimeTo}
              users={this.state.users}
              addTask={this.addTask}
              editTask={this.editTask}
              handleMemberSelect={this.handleMemberSelect}
              handleProjectSelect={this.handleProjectSelect}
              modalMemberSearchOptions={this.state.modalMemberSearchOptions}
              backToTaskInfoModal={this.backToTaskInfoModal}
              confirmModal={this.confirmModal}
              handleCategoryChange={this.handleCategoryChange}
              handlePrioritiesChange={this.handlePrioritiesChange}
              addCategory={this.addCategory}
              handleTaskNameChange={this.handleTaskNameChange}
              saveComments={this.saveComments}
            />

            <TaskInfoModal
              showInfo={this.state.showInfo && this.state.backFromTaskEvent}
              state={this.state}
              closeTaskModal={this.closeTaskModal}
              handleTaskBottomPopup={this.props.handleTaskBottomPopup}
              onGoingTask={this.props.state.isStart}
              taskInfoEdit={this.taskInfoEdit}
              confirmModal={this.confirmModal}
              resumeOrDeleteTask={this.resumeOrDeleteTask}
              handleTaskPlay={this.handleTaskPlay}
              icon={this.state.icon}
              handleTaskStartTop={this.handleTaskStartTop}
              handleTaskStart={this.handleTaskStart}
              handleTaskStop={this.handleTaskStop}
              updateTaskComments={this.updateTaskComments}
              deleteComments={this.deleteComments}
              updateComments={this.updateComments}
              timeTrackUpdate={this.timeTrackUpdate}
            />
            {this.state.taskConfirmModal ? (
              <TaskConfirm
                taskConfirmModal={this.state.taskConfirmModal}
                state={this.state}
                closeTaskModal={this.closeTaskModal}
                handleTaskBottomPopup={this.props.handleTaskBottomPopup}
                onGoingTask={this.props.state.isStart}
                taskInfoEdit={this.taskInfoEdit}
                backToTaskInfoModal={this.backToTaskInfoModal}
                taskMarkComplete={this.taskMarkComplete}
                taskResume={this.taskResume}
                taskDelete={this.taskDelete}
                handleLogTimeFrom={this.handleLogTimeFrom}
                handleLogTimeTo={this.handleLogTimeTo}
                updateTaskEventLogTime={this.updateTaskEventLogTime}
              />
            ) : null}
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Dashboard);
