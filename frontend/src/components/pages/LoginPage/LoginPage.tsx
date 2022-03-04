import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Field = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  ":not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const LoginPage: React.VFC = React.memo(() => {
  const navigate = useNavigate();

  const handleClickLoginWithGoogle = useCallback(() => {
    navigate("/projects", { replace: true });
  }, [navigate]);

  const handleClickLoginAnonymously = useCallback(() => {
    navigate("/projects", { replace: true });
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 20 }}>
      <Paper sx={{ p: 4 }} elevation={10}>
        <Field>
          <Typography>TODO BOX</Typography>
        </Field>

        <Field>
          <Button
            fullWidth
            variant="contained"
            onClick={handleClickLoginWithGoogle}
          >
            Google でログイン
          </Button>
        </Field>

        <Field>
          <Button
            fullWidth
            variant="contained"
            onClick={handleClickLoginAnonymously}
          >
            ゲストログイン
          </Button>
        </Field>
      </Paper>
    </Container>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
