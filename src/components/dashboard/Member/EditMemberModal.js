import React from "react";
import { Modal } from "react-bootstrap";
import Close from "../../../assets/images/close.svg";

const EditMemberModal = props => {
  const {
    memberName,
    memberEmail,
    memberRole,
    memberHours,
    memberProjects,
  } = props.state;
  return (
    <Modal
      className="edit-member-modal"
      show={props.show}
      onHide={props.handleClose}>
      <div className="row no-margin">
        <div className="col-md-12 header">
          <span>Edit Member</span>
          <button
            className="btn btn-link float-right"
            onClick={props.handleClose}>
            <img src={Close} alt="close" />
          </button>
        </div>
        <div className="col-md-12 body">
          <div className="col-md-12 no-padding input-row">
            <div className="col-md-3 d-inline-block no-padding label">
              Member Name
            </div>
            <div className="col-md-7 d-inline-block">
              <input
                type="text"
                name="memberName"
                value={memberName}
                onChange={props.editMemberHandleChange}
                placeholder="Write Member Name here"
                className="form-control"
              />
            </div>
          </div>
          <div className="col-md-12 no-padding input-row">
            <div className="col-md-3 d-inline-block no-padding label">
              Email ID
            </div>
            <div className="col-md-7 d-inline-block">
              <input
                type="text"
                name="memberEmail"
                value={memberEmail}
                onChange={props.editMemberHandleChange}
                placeholder="Write Member Email ID here"
                className="form-control"
              />
            </div>
          </div>
          <div className="col-md-12 no-padding input-row">
            <div className="col-md-3 d-inline-block no-padding label">Role</div>
            <div className="col-md-3 d-inline-block">
              <select
                value={memberRole}
                name="memberRole"
                onChange={props.editMemberHandleChange}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
          <div className="col-md-12 no-padding input-row">
            <div className="col-md-3 d-inline-block no-padding label">
              Working hours
            </div>
            <div className="col-md-3 d-inline-block">
              <select
                value={memberHours}
                name="memberHours"
                onChange={props.editMemberHandleChange}>
                <option value="8">8hr</option>
                <option value="9">9hr</option>
              </select>
            </div>
          </div>
          <div className="col-md-12 no-padding input-row">
            <div
              className="col-md-3 d-inline-block no-padding label"
              style={{ verticalAlign: "top" }}>
              Projects
            </div>
            <div className="col-md-7 d-inline-block">
              <MemberProject projects={memberProjects} />
            </div>
          </div>
          <div className="col-md-12 no-padding input-row">
            <div className="col-md-5 ml-auto">
              <button
                type="button"
                className="btn col-md-5 button1 btn-primary"
                onClick={props.editMember}>
                Save
              </button>
              <button
                type="button"
                className="btn col-md-6 button2 btn-primary"
                onClick={props.handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const MemberProject = props => {
  let memberProject = props.projects
    .slice(0, props.projects.length - 1)
    .map(project => project.name + ", ");
  let memberProjects = memberProject.join("");
  let lastProject = props.projects[props.projects.length - 1].name;
  return memberProjects + lastProject;
};

export default EditMemberModal;
