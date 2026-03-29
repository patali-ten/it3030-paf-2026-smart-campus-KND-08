package com.smartcampus.smart_campus_api.config;


import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        // Find or create the user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicture(picture)
                    .provider("google")
                    .roles(Set.of(Role.USER))
                    .enabled(true)
                    .build();
            return userRepository.save(newUser);
        });

        // Get the first (primary) role
        String role = user.getRoles().iterator().next().name();

        // Generate JWT
        String token = jwtUtil.generateToken(email, role, user.getId());

        // Redirect to frontend with token and role
        // The frontend reads these from the URL query params
        String redirectUrl = "http://localhost:5173/oauth-callback"
                + "?token=" + token
                + "&role=" + role
                + "&userId=" + user.getId()
                + "&name=" + java.net.URLEncoder.encode(name, "UTF-8");

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}