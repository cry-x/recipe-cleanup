import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from './ErrorPage';
import Header from '../components/Header';
import Recipe from '../components/Recipe';

function RecipePage() {
  const errorMessage = "Unable to extract recipe, please check that the URL is valid, or try again later.";

  return <ErrorBoundary FallbackComponent={() => <ErrorPage message={errorMessage}/>}>
    <Header />
    <Recipe />
  </ErrorBoundary>
}

export default RecipePage;
