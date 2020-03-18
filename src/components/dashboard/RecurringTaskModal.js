import React, { Component } from "react";
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import { PRIORITIES, DATE_FORMAT1 } from "./../../utils/Constants";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "react-loader-spinner";
import DailyPloySelect from "./../DailyPloySelect";
import DailyPloyProjectSelect from "./../DailyPloyProjectSelect";
import CommentUpload from "./../../components/dashboard/CommentUpload";
import moment from "moment";

class RecurringTaskModal extends React.Component {
  constructor(props) {
    super(props);
    this.calendarFromRef = React.createRef();
    this.calendarToRef = React.createRef();
    this.onImageDropRef = React.createRef();
    this.repeatOptions = [
      {
        id: 1,
        name: "every day"
      },
      {
        id: 2,
        name: "weekly"
      },
      {
        id: 3,
        name: "monthly"
      }
    ];
    this.state = {
      members: [],
      project: "",
      showProjectSuggestion: false,
      projectSuggestions: [],
      membersSuggestions: [],
      selectedMembers: [],
      projectSearchText: "",
      memberSearchText: "",
      isBorder: false,
      border: "solid 1px #d1d1d1",
      notFound: "hide",
      memberNotFound: "hide",
      taskName: "",
      comments: "",
      pictures: [],
      days: [
        { id: 1, name: "sunday", initial: "S", status: false },
        { id: 2, name: "monday", initial: "M", status: false },
        { id: 3, name: "tuesday", initial: "T", status: false },
        { id: 4, name: "wednesday", initial: "W", status: false },
        { id: 5, name: "thursday", initial: "T", status: false },
        { id: 6, name: "friday", initial: "F", status: false },
        { id: 7, name: "Saturday", initial: "S", status: false }
      ],
      repeatOn: this.repeatOptions[0]
    };
  }

  focusInput = component => {
    if (component) {
      component.focus();
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.state.taskName !== prevProps.state.taskName) {
      this.setState({ taskName: this.props.state.taskName });
    }
    if (this.props.state.comments !== prevProps.state.comments) {
      this.setState({ comments: this.props.state.comments });
    }
  };

  disabledHours = () => {
    var time = this.props.state.timeFrom;
    if (time) {
      var hr = time.split(":")[0];
      hr = Number(hr);
      var hoursArr = Array.from({ length: `${hr}` }, (v, k) => k);
      return hoursArr;
    }
    return [];
  };

  disabledMinutes = () => {
    var fTime = this.props.state.timeFrom;
    var tTime = this.props.state.timeTo;
    if (fTime && !tTime) {
      var min = fTime.split(":")[1];
      min = Number(min) + 1;
      var minArr = Array.from({ length: `${min}` }, (v, k) => k);
      return minArr;
    } else if (fTime && tTime && fTime.split(":")[0] === tTime.split(":")[0]) {
      var min = fTime.split(":")[1];
      min = Number(min) + 1;
      var minArr = Array.from({ length: `${min}` }, (v, k) => k);
      return minArr;
    }
    return [];
  };

  handleDateChangeRaw = e => {
    e.preventDefault();
  };

  openFromCalender = () => {
    this.calendarFromRef.current.setOpen(true);
  };
  openToCalender = () => {
    this.calendarToRef.current.setOpen(true);
  };

  handleInputChange = async e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  onBlurInput = () => {
    this.props.handleTaskNameChange("taskName", this.state.taskName);
  };

  onBlurComment = () => {
    this.props.handleTaskNameChange("comments", this.state.comments);
  };

  handleImageRef = () => {
    this.onImageDropRef.current.inputElement.click();
  };

  isTody = () => {
    return (
      moment().format(DATE_FORMAT1) ===
      moment(this.props.state.dateFrom).format(DATE_FORMAT1)
    );
  };

  onImageDrop = picture => {
    this.setState({
      pictures: this.state.pictures.concat(picture)
    });
  };

  changeDay = day => {
    var days = this.state.days;
    var day = days.find(d => d == day);
    day["status"] = !day["status"];
    this.setState({ days: days });
  };

  handleRepeatOnChange = repeat => {
    this.setState({ repeatOn: repeat });
  };

  handleRepeatOnInputChange = e => {
    const { name, value } = e.target;
    this.setState({ repeatOnNumber: value });
  };

  render() {
    const { props } = this;
    return (
      <>
        <div className="col-md-12 body">
          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">Task</div>
            <div className="col-md-10 d-inline-block">
              <input
                type="text"
                name="taskName"
                value={props.state.taskName}
                onChange={props.handleInputChange}
                placeholder="Task Name"
                className="form-control"
              />
            </div>

            {this.props.state.errors.taskNameError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md- d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.taskNameError}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">
              Project
            </div>
            <div
              className={`col-md-10 d-inline-block ${
                props.state.taskButton !== "Add" ? "disable-project-select" : ""
              }`}
            >
              <DailyPloyProjectSelect
                options={this.props.state.memberProjects}
                placeholder="Select Project"
                label="name"
                className="suggestion-z-index-100"
                default={this.props.state.project}
                iconType="block"
                onChange={this.props.handleProjectSelect}
              />
            </div>
            {this.props.state.errors.projectError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md-10 d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.projectError}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">
              Category
            </div>
            <div className="col-md-10 d-inline-block">
              <DailyPloySelect
                options={this.props.state.taskCategories}
                placeholder="Select Category"
                className="suggestion-z-index-50"
                default={this.props.state.taskCategorie}
                onChange={this.props.handleCategoryChange}
                canAdd={true}
                addNew={this.props.addCategory}
              />
            </div>
            {this.props.state.errors.categoryError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md-10 d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.categoryError}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">
              Priority
            </div>
            <div className="col-md-10 d-inline-block">
              <DailyPloySelect
                options={PRIORITIES}
                placeholder="Select priority"
                iconType="circle"
                default={this.props.state.taskPrioritie}
                name="priorityName"
                label="label"
                suggesionBy="label"
                onChange={this.props.handlePrioritiesChange}
              />
            </div>
          </div>

          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">
              Member
            </div>
            <div className="col-md-10 d-inline-block">
              <DailyPloySelect
                options={this.props.modalMemberSearchOptions}
                placeholder="Select Member"
                default={this.props.state.selectedMembers[0]}
                icon="fa fa-user"
                onChange={this.props.handleMemberSelect}
              />
            </div>
            {this.props.state.errors.memberError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md- d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.memberError}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">
              Repeat Every
            </div>
            <div className="col-md-3 d-inline-block">
              <input
                type="number"
                name="repeatOnNumber"
                value={this.state.repeatOnNumber}
                onChange={e => this.handleRepeatOnInputChange(e)}
                placeholder="Enter"
                className="form-control"
              />
            </div>
            <div className="col-md-7 d-inline-block">
              <DailyPloySelect
                options={this.repeatOptions}
                default={this.state.repeatOn}
                onChange={this.handleRepeatOnChange}
              />
            </div>
            {/* {this.props.state.errors.memberError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md- d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.memberError}
                  </span>
                </div>
              </div>
            ) : null} */}
          </div>

          {this.state.repeatOn.name == "weekly" ? (
            <div className="col-md-12 no-padding input-row">
              <div className="col-md-2 d-inline-block no-padding label">
                Repeat On
              </div>
              <div className="col-md-10 d-inline-block">
                {this.state.days.map(day => {
                  return (
                    <div
                      className={`d-inline-block day-icon ${
                        day.status ? "selected" : ""
                      }`}
                      onClick={() => this.changeDay(day)}
                    >
                      {day.initial}
                    </div>
                  );
                })}
              </div>
              {/* {this.props.state.errors.memberError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md- d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.memberError}
                  </span>
                </div>
              </div>
            ) : null} */}
            </div>
          ) : null}

          {this.state.repeatOn.name == "monthly" ? (
            <div className="col-md-12 no-padding input-row">
              <div className="col-md-2 d-inline-block no-padding label"></div>
              <div className="col-md-10 d-inline-block">
                <div
                  className="d-inline-block task-datepicker no-padding"
                  style={{ width: "125px" }}
                >
                  <span className="" style={{ marginLeft: "0px" }}>
                    Monthly on date:
                  </span>
                </div>
                <div className="col-md-7 d-inline-block task-datepicker no-padding">
                  <div className="d-inline-block picker">
                    <DatePicker
                      className="width-to"
                      ref={this.calendarToRef}
                      selected={props.state.dateTo}
                      onChange={props.handleDateTo}
                      placeholderText="Select Date"
                      onChangeRaw={this.handleDateChangeRaw}
                    />
                    <span
                      className="task-date-picker-icon"
                      style={{ right: "85px" }}
                    >
                      <i
                        onClick={this.openToCalender}
                        className="fa fa-calendar"
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
              {/* {this.props.state.errors.memberError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md- d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.memberError}
                  </span>
                </div>
              </div>
            ) : null} */}
            </div>
          ) : null}

          <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">Date</div>
            <div className="col-md-10 d-inline-block no-padding">
              <div className="col-md-12 d-inline-block no-padding">
                <div className="col-md-6 d-inline-block task-datepicker">
                  <div className="d-inline-block label date-text-light">
                    <span>From:</span>
                  </div>
                  <div className="d-inline-block picker">
                    <DatePicker
                      ref={this.calendarFromRef}
                      selected={props.state.dateFrom}
                      onChange={props.handleDateFrom}
                      maxDate={props.state.dateTo}
                      placeholderText="Select Date"
                      onChangeRaw={this.handleDateChangeRaw}
                    />
                    <span className="task-date-picker-icon">
                      <i
                        onClick={this.openFromCalender}
                        className="fa fa-calendar"
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                </div>
                <div className="col-md-6 d-inline-block task-datepicker no-padding">
                  <div className="d-inline-block  date-text-light ">
                    <span className="width-to">To:</span>
                  </div>
                  <div className="d-inline-block picker">
                    <DatePicker
                      className="width-to"
                      ref={this.calendarToRef}
                      minDate={props.state.dateFrom}
                      selected={props.state.dateTo}
                      onChange={props.handleDateTo}
                      placeholderText="Select Date"
                      disabled={props.state.disabledDateTo}
                      onChangeRaw={this.handleDateChangeRaw}
                    />
                    <span
                      className="task-date-picker-icon"
                      style={{ right: "51px" }}
                    >
                      <i
                        onClick={this.openToCalender}
                        className="fa fa-calendar"
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {this.props.state.errors.dateFromError ||
            this.props.state.errors.dateToError ? (
              <div className="col-md-12">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md-5 d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.dateFromError}
                  </span>
                </div>
                <div className="col-md-5 d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.dateToError}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* <div className="col-md-12 no-padding input-row">
            <div className="col-md-2 d-inline-block no-padding label">Time</div>
            <div
              className="col-md-10 d-inline-block"
              style={{ paddingRight: "0px" }}
            >
              <div className="col-md-12 d-inline-block no-padding">
                <div
                  className="col-md-6 d-inline-block no-padding "
                  // style={{ maxWidth: "219px" }}
                >
                  <div className="col-md-3 no-padding d-inline-block date-text-light">
                    <span>From:</span>
                  </div>
                  <div
                    className="col-md-7 d-inline-block time-picker-container"
                    style={{ paddingRight: "0" }}
                  >
                    <TimePicker
                      placeholder="Select"
                      value={this.props.state.timeDateFrom}
                      showSecond={false}
                      onChange={props.handleTimeFrom}
                      format={props.format}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-inline-block no-padding ">
                  <div className="col-md-2 no-padding d-inline-block date-text-light">
                    <span>To:</span>
                  </div>
                  <div
                    className="col-md-7 d-inline-block time-picker-container"
                    style={{ paddingRight: "0" }}
                  >
                    <TimePicker
                      value={this.props.state.timeDateTo}
                      placeholder="Select"
                      showSecond={false}
                      onChange={props.handleTimeTo}
                      disabledMinutes={this.disabledMinutes}
                      disabledHours={this.disabledHours}
                      format={props.format}
                    />
                  </div>
                </div>
              </div>
            </div>

            {this.props.state.errors.timeFromError ||
            this.props.state.errors.timeToError ? (
              <div className="col-md-12 d-inline-block no-padding">
                <div className="col-md-2 d-inline-block no-padding"></div>
                <div className="col-md-4 d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.timeFromError}
                  </span>
                </div>
                <div className="col-md-4 d-inline-block no-padding">
                  <span className="error-warning">
                    {this.props.state.errors.timeToError}
                  </span>
                </div>
              </div>
            ) : null}
          </div> */}

          <div className="col-md-12 row no-margin no-padding input-row">
            <div className="col-md-2 no-padding label">Comments</div>
            <div className="col-md-10">
              <CommentUpload
                state={this.state}
                showSave={props.state.taskButton === "Add" ? false : true}
                showAttachIcon={props.state.taskButton === "Add" ? false : true}
                defaultComments={props.state.comments}
                handleInputChange={this.props.handleInputChange}
                showSave={false}
                showAttachIcon={false}
              />
            </div>
          </div>

          <div className="no-padding input-row">
            <div className="action-btn">
              {this.isTody() ? (
                <label>
                  <span className="tt-conf-btn">
                    You want to start Time Track ?
                  </span>
                  <input
                    type="checkbox"
                    name="isContactChecked"
                    onChange={e => this.props.toggleTaskStartState(e)}
                    style={{
                      margin: "0px 20px"
                    }}
                  />
                </label>
              ) : null}
              <button
                type="button"
                className="button3 btn-primary pull-right"
                onClick={
                  props.state.taskButton !== "Add"
                    ? this.props.backToTaskInfoModal
                    : this.props.closeTaskModal
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className={`button1 btn-primary pull-right ${
                  props.state.taskloader ? "disabled" : ""
                }`}
                onClick={() =>
                  props.state.taskButton === "Add"
                    ? props.addTask()
                    : props.editTask()
                }
              >
                {props.state.taskButton}
                {this.props.state.taskloader ? (
                  <Loader
                    type="Oval"
                    color="#FFFFFF"
                    height={20}
                    width={20}
                    style={{ paddingLeft: "5px" }}
                    className="d-inline-block login-signup-loader"
                  />
                ) : null}
              </button>
              {this.props.state.fromInfoEdit ? (
                <button
                  type="button"
                  className="pull-right button3 btn-primary"
                  onClick={() => props.confirmModal("delete")}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default RecurringTaskModal;
