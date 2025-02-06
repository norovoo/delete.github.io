import React from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import "./OrderForm.css";

const initialValues = {
  location: {
    neighborhood: "",
    address: "",
    lot: "",
    plan: "",
  },
  dates: {
    startDate: "",
    endDate: "",
    createdDatetime: new Date().toISOString().slice(0, 16), // Default to current date and time
  },
  orderItems: [],
};
const handleSubmit = async (values, { resetForm }) => {
    try {
      // Flatten the form values
      const payload = {
        body: JSON.stringify({
          neighborhood: values.location.neighborhood,
          address: values.location.address,
          lot: values.location.lot,
          plan: values.location.plan,
          startDate: values.dates.startDate,
          endDate: values.dates.endDate,
          createdDatetime: values.dates.createdDatetime,
          orderItems: values.orderItems,
        }),
      };
  
      // Send flattened payload
      const response = await axios.post(
        "https://wdco38j8zd.execute-api.us-east-1.amazonaws.com/default/createOrder", // API Gateway URL
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      alert("Order created successfully! Order ID: " + response.data.orderId);
      resetForm();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };


const validationSchema = Yup.object({
  location: Yup.object({
    neighborhood: Yup.string().required("Neighborhood is required"),
    address: Yup.string().required("Address is required"),
    lot: Yup.string().required("Lot # is required"),
    plan: Yup.string().required("Plan # is required"),
  }),
  dates: Yup.object({
    startDate: Yup.date().required("Start Date is required"),
    endDate: Yup.date().required("End Date is required"),
    createdDatetime: Yup.date().required("Created Datetime is required"),
  }),
  orderItems: Yup.array().of(
    Yup.object({
      type: Yup.string().required("Item type is required"),
      description: Yup.string().required("Description is required"),
    })
  ),
});

const OrderForm = () => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form className="form-container">
          {/* Section 1: Location */}
          <div className="form-section">
            <h3>Location</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Neighborhood:</label>
                <Field name="location.neighborhood" placeholder="Neighborhood" />
                <ErrorMessage
                  name="location.neighborhood"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <Field name="location.address" placeholder="Address" />
                <ErrorMessage
                  name="location.address"
                  component="div"
                  className="error-message"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Lot #:</label>
                <Field name="location.lot" placeholder="Lot #" />
                <ErrorMessage
                  name="location.lot"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label>Plan #:</label>
                <Field name="location.plan" placeholder="Plan #" />
                <ErrorMessage
                  name="location.plan"
                  component="div"
                  className="error-message"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dates */}
          <div className="form-section">
            <h3>Dates</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Start/Install Date:</label>
                <Field type="date" name="dates.startDate" />
                <ErrorMessage
                  name="dates.startDate"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label>End/QCI Date:</label>
                <Field type="date" name="dates.endDate" />
                <ErrorMessage
                  name="dates.endDate"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label>Created Datetime:</label>
                <Field type="datetime-local" name="dates.createdDatetime" />
                <ErrorMessage
                  name="dates.createdDatetime"
                  component="div"
                  className="error-message"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Order Items */}
          <div className="form-section">
            <h3>Order Items</h3>
            <FieldArray name="orderItems">
              {({ push, remove }) => (
                <div>
                  {values.orderItems.map((_, index) => (
                    <div key={index} className="form-row">
                      <div className="form-group">
                        <label>Type:</label>
                        <div className="">
                        <Field as="select" name={`orderItems[${index}].type`} className="wide-select">
                            <option value="">Select Type</option>
                            <option value="shower">Shower</option>
                            <option value="mirror">Mirror</option>
                        </Field>
                        </div>
                        <ErrorMessage
                          name={`orderItems[${index}].type`}
                          component="div"
                          className="error-message"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description:</label>
                        <Field
                          name={`orderItems[${index}].description`}
                          placeholder="Description (e.g., color, details)"
                          className = "wide-select"
                        />
                        <ErrorMessage
                          name={`orderItems[${index}].description`}
                          component="div"
                          className="error-message"
                        />
                      </div>
                      <button
                        type="button"
                        className="remove-item-button"
                        onClick={() => remove(index)}
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-button"
                    onClick={() => push({ type: "", description: "" })}
                  >
                    Add Order Item
                  </button>
                </div>
              )}
            </FieldArray>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default OrderForm;