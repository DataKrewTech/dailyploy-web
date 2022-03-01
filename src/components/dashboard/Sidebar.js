import React, { Component } from "react";
import AddWorkspace from "./Sidebar/AddWorkspace";
import SelectWorkspace from "./Sidebar/SelectWorkspace";
import cookie from "react-cookies";
import DailyPloyToast from "./../../components/DailyPloyToast";
import { toast } from "react-toastify";
import { post } from "./../../utils/API";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      setShow: false,
      workspaceName: "",
      timetrack_enabled: false,
      nameError: "",
      isLoading: false,
    };
  }
  changeLogType = (val) => {
    this.setState({
      timetrack_enabled: val,
    });
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
      nameError: "",
    });
  };

  callWorkspace = (id) => {
    cookie.save("workspaceId", id, { path: "/" });
    localStorage.setItem("selProject", "");
    window.location.href = `#/workspace/${id}/dashboard`
    window.location.reload();
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value, nameError: value ? "" : "cannot be empty" });
  };

  createWorkspace = async () => {
    if (this.state.workspaceName != "") {
      let workspaceDate = {
        user_id: this.props.userInfo.id,
        name: this.state.workspaceName,
        timetrack_enabled: this.state.timetrack_enabled,
      };
      this.setState({ isLoading: true });
      try {
        const { data } = await post(workspaceDate, `add_workspace`);
        toast(
          <DailyPloyToast
            message="Workspace Created successfully!"
            status="success"
          />,
          { autoClose: 2000, position: toast.POSITION.TOP_CENTER }
        );
        let workspace = {
          owner: this.props.userInfo,
          id: data.workspace_id,
          name: data.workspace_name,
          type: "individual",
        };
        this.props.updateWorkspaces(workspace);
        this.setState({
          show: false,
          setShow: false,
          workspaceName: "",
          isLoading: false,
        });
      } catch (e) {
        this.setState({ show: false, setShow: false, isLoding: false });
      }
    } else {
      this.setState({ nameError: "cannot be empty" });
    }
  };

  render() {
    let workspacesArr = this.props.workspaces;
    let divideArr = workspacesArr.map((item) => item);
    return (
      <>
        <div className="workspace-list">
          <ul>
            {divideArr.map((item, index) => (
              <SelectWorkspace
                item={item}
                index={index}
                key={index}
                workspaceId={this.props.workspaceId}
                workspaceName={this.props.workspaceName}
                callWorkspace={this.callWorkspace}
              />
            ))}
            <li>
              <div className="workspace-box" style={{ paddingTop: "8px" }}>
                <button className="btn btn-link" onClick={this.showTaskModal}>
                  +
                </button>
              </div>
              {/* <div className="workspace-add-btn">Add New</div> */}
              {/* <AddWorkspaceModal
                state={this.state}
                onHideModal={this.closeTaskModal}
              /> */}
              <AddWorkspace
                state={this.state}
                onHideModal={this.closeTaskModal}
                handleInputChange={this.handleInputChange}
                changeLogType={this.changeLogType}
                createWorkspace={this.createWorkspace}
              />
            </li>
          </ul>
        </div>
      </>
    );
  }
}

export default Sidebar;
