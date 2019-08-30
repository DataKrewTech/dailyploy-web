import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import Header from "./Header";
import { get, post, logout, mockPost, mockGet } from "../../utils/API";
import MenuBar from "./MenuBar";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import GeneralSettings from "./UserSettings/GeneralSettings";
import PrivacySettings from "./UserSettings/PrivacySettings";

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workspaces: [],
      workspaceId: "",
      projectNames: [],
      sort: "week",
      members: [],
    };
  }
  logout = async () => {
    await logout();
    this.props.history.push("/login");
  };
  async componentDidMount() {
    try {
      const { data } = await get("workspaces");
      this.setState({ workspaces: data.workspaces });
    } catch (e) {
      console.log("err", e);
    }

    this.getWorkspaceParams();

    try {
      const { data } = await mockGet("members");
      // console.log(data);
      this.setState({ members: data });
    } catch (e) {
      console.log("err", e);
    }
  }

  getWorkspaceParams = () => {
    const { workspaceId } = this.props.match.params;
    this.setState({ workspaceId: workspaceId });
  };

  onSelectSort = value => {
    console.log("selected value ", value);
    this.setState({ sort: value });
  };

  render() {
    console.log("members", this.state.members);
    return (
      <>
        <Header
          logout={this.logout}
          workspaces={this.state.workspaces}
          workspaceId={this.state.workspaceId}
        />
        <MenuBar
          onSelectSort={this.onSelectSort}
          workspaceId={this.state.workspaceId}
        />
        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <div className="row no-margin workspace1-setting">
            <div className="col-md-2 side-tabs">
              <Nav variant="link" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="first">General</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="second">Privacy</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
            <div className="col-md-10">
              <div className="col-md-12 body-tabs">
                <Tab.Content>
                  <Tab.Pane eventKey="first">
                    <GeneralSettings />
                  </Tab.Pane>
                  <Tab.Pane eventKey="second">
                    <PrivacySettings />
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </div>
          </div>
        </Tab.Container>
      </>
    );
  }
}

export default withRouter(Settings);
